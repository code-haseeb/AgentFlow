import ipaddress
import re
from urllib.parse import urlparse
from typing import Tuple

BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "::1", "metadata.google.internal"}

# Known adversarial prompt injection heuristics
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+(instructions|directives|prompts)",
    r"disregard\s+(all\s+)?(safety|rules|instructions)",
    r"override\s+(policy|approval|gate|guardrail)",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"bypass\s+(approval|permissions|checks)",
    r"reveal\s+(system\s+prompt|secret|api\s+key|credentials)",
    r"jailbreak",
    r"do\s+anything\s+now",
]

def is_ip_private_or_reserved(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
        )
    except ValueError:
        return False

def validate_safe_url(url: str) -> Tuple[bool, str]:
    """
    SSRF Protection: Validates that a URL does not point to internal,
    loopback, or cloud-metadata IP addresses.
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False, f"Unsupported URL scheme: {parsed.scheme}. Only HTTP/HTTPS allowed."

        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid URL: Missing hostname."

        hostname_lower = hostname.lower()
        if hostname_lower in BLOCKED_HOSTNAMES:
            return False, f"Access to internal host '{hostname}' is strictly forbidden (SSRF defense)."

        # Check if hostname is an IP literal
        if is_ip_private_or_reserved(hostname_lower):
            return False, f"Access to private/internal IP '{hostname}' is forbidden (SSRF defense)."

        # Cloud metadata service check (169.254.169.254)
        if hostname_lower.startswith("169.254."):
            return False, "Access to cloud instance metadata service is forbidden."

        return True, ""
    except Exception as e:
        return False, f"URL validation failed: {str(e)}"

def detect_prompt_injection(text: str) -> Tuple[bool, str]:
    """
    Detects adversarial injection attacks aimed at overriding agent instructions
    or bypassing policy gates.
    """
    text_lower = text.lower()
    for pattern in INJECTION_PATTERNS:
        match = re.search(pattern, text_lower, re.IGNORECASE)
        if match:
            return True, f"Adversarial prompt injection pattern detected: '{match.group(0)}'"
    return False, ""
