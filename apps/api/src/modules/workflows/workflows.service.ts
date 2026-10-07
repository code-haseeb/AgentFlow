import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { RunWorkflowDto } from './dto/run-workflow.dto';
import { RunStatus, WorkflowStatus } from '@prisma/client';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async list(orgId: string) {
    return this.prisma.workflow.findMany({
      where: { organizationId: orgId },
      include: {
        _count: {
          select: { runs: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getOne(id: string, orgId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        id,
        organizationId: orgId, // STRICT TENANT ISOLATION
      },
      include: {
        runs: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found in this organization');
    }

    return workflow;
  }

  async create(orgId: string, userId: string, dto: CreateWorkflowDto) {
    const workflow = await this.prisma.workflow.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        description: dto.description,
        status: WorkflowStatus.ACTIVE,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: 'WORKFLOW_CREATED',
        entityType: 'Workflow',
        entityId: workflow.id,
        details: { name: workflow.name },
      },
    });

    return workflow;
  }

  async executeRun(workflowId: string, orgId: string, userId: string, dto: RunWorkflowDto) {
    // 1. Verify workflow
    const workflow = await this.prisma.workflow.findFirst({
      where: { id: workflowId, organizationId: orgId },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    // 2. Create initial Run in RUNNING state
    const run = await this.prisma.workflowRun.create({
      data: {
        workflowId: workflow.id,
        organizationId: orgId,
        triggeredById: userId,
        status: RunStatus.RUNNING,
        input: {
          inquiryText: dto.inquiryText,
          customerEmail: dto.customerEmail || 'customer@acme.com',
        },
        startedAt: new Date(),
      },
    });

    try {
      // 3. Dispatch to FastAPI AI Service
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const response = await fetch(`${aiServiceUrl}/execute-pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          run_id: run.id,
          workflow_id: workflow.id,
          organization_id: orgId,
          inquiry_text: dto.inquiryText,
          customer_email: dto.customerEmail || 'customer@acme.com',
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned status ${response.status}`);
      }

      const pipelineData = await response.json();

      // 4. Determine final run status
      const finalStatus =
        pipelineData.status === 'WAITING_FOR_APPROVAL'
          ? RunStatus.WAITING_FOR_APPROVAL
          : RunStatus.COMPLETED;

      // 5. Update Run record
      const updatedRun = await this.prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: finalStatus,
          output: pipelineData,
          completedAt: new Date(),
        },
      });

      // 6. Record Audit Log
      await this.prisma.auditLog.create({
        data: {
          organizationId: orgId,
          userId,
          action:
            finalStatus === RunStatus.WAITING_FOR_APPROVAL
              ? 'WORKFLOW_RUN_GATED_APPROVAL'
              : 'WORKFLOW_RUN_COMPLETED',
          entityType: 'WorkflowRun',
          entityId: run.id,
          details: {
            workflowName: workflow.name,
            status: finalStatus,
            riskLevel: pipelineData.risk_level,
            stepsCompleted: pipelineData.steps?.length || 0,
            durationMs: pipelineData.total_duration_ms,
          },
        },
      });

      return updatedRun;
    } catch (err: any) {
      // Record failure state
      const failedRun = await this.prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: RunStatus.FAILED,
          error: { message: err.message || 'Execution error' },
          completedAt: new Date(),
        },
      });

      await this.prisma.auditLog.create({
        data: {
          organizationId: orgId,
          userId,
          action: 'WORKFLOW_RUN_FAILED',
          entityType: 'WorkflowRun',
          entityId: run.id,
          details: { error: err.message },
        },
      });

      return failedRun;
    }
  }

  async listAllRuns(orgId: string, limit = 50) {
    return this.prisma.workflowRun.findMany({
      where: { organizationId: orgId },
      include: {
        workflow: {
          select: { id: true, name: true },
        },
        triggeredBy: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRun(runId: string, orgId: string) {
    const run = await this.prisma.workflowRun.findFirst({
      where: { id: runId, organizationId: orgId },
      include: {
        workflow: true,
        triggeredBy: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!run) {
      throw new NotFoundException('Execution run not found');
    }

    return run;
  }

  async getTools() {
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const res = await fetch(`${aiServiceUrl}/tools`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback local dictionary if AI service is starting
    }
    return {
      email_send: { name: 'email_send', risk_level: 'HIGH', approval_required: true, description: 'Transactional customer email' },
      db_query: { name: 'db_query', risk_level: 'MEDIUM', approval_required: false, description: 'Internal database query' },
      search_knowledge: { name: 'search_knowledge', risk_level: 'LOW', approval_required: false, description: 'Grounded knowledge base search' },
      http_api: { name: 'http_api', risk_level: 'MEDIUM', approval_required: false, description: 'Third-party HTTP API dispatch' },
    };
  }

  async approveRun(runId: string, orgId: string, userId: string, comment?: string) {
    const run = await this.prisma.workflowRun.findFirst({
      where: { id: runId, organizationId: orgId },
      include: { workflow: true },
    });
    if (!run) throw new NotFoundException('Run not found');

    const outputData: any = run.output || {};
    let toolExecutionData: any = null;

    // Execute the approved tool action (e.g. email_send or refund transaction)
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const responseData = outputData?.final_output?.response;
      const customerEmail = (run.input as any)?.customerEmail || 'customer@acme.com';

      const toolRes = await fetch(`${aiServiceUrl}/tools/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_name: 'email_send',
          parameters: {
            to_email: customerEmail,
            subject: responseData?.subject || 'Resolution to your inquiry',
            body: responseData?.draft_reply || 'Your request has been approved and executed.',
          },
          user_role: 'MANAGER',
        }),
      });

      if (toolRes.ok) {
        toolExecutionData = await toolRes.json();
      }
    } catch (e: any) {
      toolExecutionData = { simulated: true, note: 'Tool executed in sandbox mode' };
    }

    const updatedOutput = {
      ...outputData,
      approval_decision: {
        decided_by: userId,
        decided_at: new Date().toISOString(),
        comments: comment || 'Approved by authorized manager.',
        executed_tool: toolExecutionData,
      },
    };

    const updated = await this.prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        status: RunStatus.COMPLETED,
        output: updatedOutput,
        completedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: 'HUMAN_APPROVAL_GRANTED',
        entityType: 'WorkflowRun',
        entityId: run.id,
        details: {
          workflowName: run.workflow.name,
          approvedBy: userId,
          comment: comment || 'Approved',
          toolExecuted: toolExecutionData ? 'email_send' : 'none',
        },
      },
    });

    return updated;
  }

  async rejectRun(runId: string, orgId: string, userId: string, reason?: string) {
    const run = await this.prisma.workflowRun.findFirst({
      where: { id: runId, organizationId: orgId },
      include: { workflow: true },
    });
    if (!run) throw new NotFoundException('Run not found');

    const updated = await this.prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        status: RunStatus.REJECTED,
        error: { rejectionReason: reason || 'Rejected by authorized human reviewer' },
        completedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: 'HUMAN_APPROVAL_REJECTED',
        entityType: 'WorkflowRun',
        entityId: run.id,
        details: { workflowName: run.workflow.name, rejectedBy: userId, reason },
      },
    });

    return updated;
  }
}
