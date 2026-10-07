from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from ..base import BaseTool

class DatabaseInput(BaseModel):
    collection: str = Field(description="Target table/collection (e.g. invoices, subscriptions, users)")
    operation: str = Field(description="Query operation: 'select', 'insert', 'update'")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Query filter or mutation payload")

class DatabaseOutput(BaseModel):
    operation: str
    collection: str
    row_count: int
    data: List[Dict[str, Any]]

# Allowed collections for sandboxed agent access
ALLOWED_COLLECTIONS = {"invoices", "subscriptions", "support_tickets", "knowledge_base"}

class DatabaseTool(BaseTool):
    name = "db_query"
    description = "Queries internal business records and executes controlled updates."
    risk_level = "MEDIUM"  # Mutating operations escalate to HIGH
    approval_required = False
    input_schema = DatabaseInput
    output_schema = DatabaseOutput

    def get_risk_for_input(self, validated_input: DatabaseInput) -> tuple[str, bool]:
        if validated_input.operation.lower() in ("insert", "update", "delete"):
            return "HIGH", True
        return "MEDIUM", False

    async def run(self, validated_input: DatabaseInput) -> Dict[str, Any]:
        if validated_input.collection not in ALLOWED_COLLECTIONS:
            raise ValueError(f"Collection '{validated_input.collection}' is not permitted for agent access.")

        op = validated_input.operation.lower()

        # Simulated structured responses for approved collections
        if validated_input.collection == "invoices":
            return {
                "operation": op,
                "collection": validated_input.collection,
                "row_count": 1,
                "data": [
                    {
                        "invoice_id": "INV-9281",
                        "amount": 299.00,
                        "currency": "USD",
                        "status": "PAID" if op == "select" else "REFUND_PENDING",
                        "customer_id": "cust_821",
                    }
                ],
            }
        elif validated_input.collection == "subscriptions":
            return {
                "operation": op,
                "collection": validated_input.collection,
                "row_count": 1,
                "data": [
                    {
                        "plan": "Business Tier",
                        "billing_cycle": "annual",
                        "status": "active",
                        "renewal_date": "2027-06-01",
                    }
                ],
            }
        else:
            return {
                "operation": op,
                "collection": validated_input.collection,
                "row_count": 0,
                "data": [],
            }
