"""API client documentation (Python) for the WhatsApp AI backend.

This module provides a simple, documented set of helper functions that correspond
to all the available REST endpoints in the backend.

Usage:
    from api_docs import ApiClient

    client = ApiClient(base_url="http://localhost:4000", jwt_token="...")
    token = client.login("email@example.com", "password")
    instances = client.list_instances()

NOTE: This is documentation-friendly code, not a production SDK. It uses the
`requests` library and returns raw Response objects for clarity.

"""

from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional

import requests


@dataclass
class ApiClient:
    """Simple API client for the WhatsApp AI backend.

    This client wraps all of the documented REST endpoints in this project.

    Attributes:
        base_url: The root URL of the backend (e.g., "http://localhost:4000").
        jwt_token: Optional JWT used for authenticated requests.
    """

    base_url: str = "http://localhost:4000"
    jwt_token: Optional[str] = None

    @property
    def headers(self) -> Dict[str, str]:
        headers: Dict[str, str] = {"Content-Type": "application/json"}
        if self.jwt_token:
            headers["Authorization"] = f"Bearer {self.jwt_token}"
        return headers

    # ---------------------------------------------------------------------
    # Authentication
    # ---------------------------------------------------------------------

    def signup(self, email: str, password: str) -> requests.Response:
        """Create a new user account."""
        payload = {"email": email, "password": password}
        return requests.post(
            f"{self.base_url}/api/auth/signup", json=payload, headers=self.headers
        )

    def login(self, email: str, password: str) -> requests.Response:
        """Log in and receive a JWT token."""
        payload = {"email": email, "password": password}
        return requests.post(
            f"{self.base_url}/api/auth/login", json=payload, headers=self.headers
        )

    # ---------------------------------------------------------------------
    # Instances
    # ---------------------------------------------------------------------

    def list_instances(self) -> requests.Response:
        """List all instances for the authenticated user."""
        return requests.get(f"{self.base_url}/api/instances", headers=self.headers)

    def create_instance(self, name: str) -> requests.Response:
        """Create a new instance."""
        payload = {"name": name}
        return requests.post(
            f"{self.base_url}/api/instances", json=payload, headers=self.headers
        )

    def get_instance(self, instance_id: str) -> requests.Response:
        """Retrieve details for a single instance."""
        return requests.get(
            f"{self.base_url}/api/instances/{instance_id}", headers=self.headers
        )

    def start_instance(self, instance_id: str) -> requests.Response:
        """Start an instance and initialize WhatsApp client."""
        headers = {"Authorization": f"Bearer {self.jwt_token}"} if self.jwt_token else {}
        return requests.post(
            f"{self.base_url}/api/instances/{instance_id}/start",
            headers=headers,
        )

    def connect_instance(self, instance_id: str) -> requests.Response:
        """Force a QR connection (clears session and forces new QR)."""
        headers = {"Authorization": f"Bearer {self.jwt_token}"} if self.jwt_token else {}
        return requests.post(
            f"{self.base_url}/api/instances/{instance_id}/connect",
            headers=headers,
        )

    def get_instance_qr(self, instance_id: str) -> requests.Response:
        """Fetch the latest QR code string for the instance.

        Notes:
            This endpoint may return 202 when the QR is not yet ready. It will
            also attempt to start the instance if it is not already running.
        """
        return requests.get(
            f"{self.base_url}/api/instances/{instance_id}/qr", headers=self.headers
        )

    def send_instance_message(
        self, instance_id: str, contact_id: str, text: str
    ) -> requests.Response:
        """Send a WhatsApp message from a running instance."""
        payload = {"contactId": contact_id, "text": text}
        return requests.post(
            f"{self.base_url}/api/instances/{instance_id}/send",
            json=payload,
            headers=self.headers,
        )

    def stop_instance(self, instance_id: str) -> requests.Response:
        """Stop a running instance."""
        headers = {"Authorization": f"Bearer {self.jwt_token}"} if self.jwt_token else {}
        return requests.post(
            f"{self.base_url}/api/instances/{instance_id}/stop",
            headers=headers,
        )

    def delete_instance(self, instance_id: str) -> requests.Response:
        """Delete an instance."""
        headers = {"Authorization": f"Bearer {self.jwt_token}"} if self.jwt_token else {}
        return requests.delete(
            f"{self.base_url}/api/instances/{instance_id}",
            headers=headers,
        )

    # ---------------------------------------------------------------------
    # Conversations
    # ---------------------------------------------------------------------

    def list_conversations(self, instance_id: str) -> requests.Response:
        """List recent conversations for an instance."""
        return requests.get(
            f"{self.base_url}/api/instances/{instance_id}/conversations",
            headers=self.headers,
        )

    # ---------------------------------------------------------------------
    # Agent Config (per instance)
    # ---------------------------------------------------------------------

    def get_agent_config(self, instance_id: str) -> requests.Response:
        """Get the AI agent configuration for an instance."""
        return requests.get(
            f"{self.base_url}/api/instances/{instance_id}/agent-config",
            headers=self.headers,
        )

    def update_agent_config(self, instance_id: str, config: Dict[str, Any]) -> requests.Response:
        """Update the AI agent configuration for an instance."""
        return requests.put(
            f"{self.base_url}/api/instances/{instance_id}/agent-config",
            json=config,
            headers=self.headers,
        )

    def reset_agent_config(self, instance_id: str) -> requests.Response:
        """Reset the agent configuration to defaults and disable it."""
        return requests.delete(
            f"{self.base_url}/api/instances/{instance_id}/agent-config",
            headers=self.headers,
        )

    # ---------------------------------------------------------------------
    # AI Agents
    # ---------------------------------------------------------------------

    def list_ai_agents(self) -> requests.Response:
        """List all AI agents for the authenticated user."""
        return requests.get(f"{self.base_url}/api/ai-agents", headers=self.headers)

    def create_ai_agent(self, agent_data: Dict[str, Any]) -> requests.Response:
        """Create a new AI agent.

        Args:
            agent_data: A dictionary containing the agent configuration. Example:
                {
                    "businessName": "My Business",
                    "description": "A helpful AI agent for customer support",
                    "products": "Software products and services",
                    "faq": "Common questions and answers",
                    "instructions": "Be polite and helpful",
                    "tone": "Professional",
                    "language": "English",
                    "minDelay": 2,
                    "maxDelay": 5,
                    "typingSimulation": True,
                    "memory": "10 Minutes",
                    "enabled": True
                }
        """
        return requests.post(
            f"{self.base_url}/api/ai-agents", json=agent_data, headers=self.headers
        )

    def get_ai_agent(self, agent_id: str) -> requests.Response:
        """Fetch a specific AI agent by ID."""
        return requests.get(
            f"{self.base_url}/api/ai-agents/{agent_id}", headers=self.headers
        )

    def update_ai_agent(self, agent_id: str, updates: Dict[str, Any]) -> requests.Response:
        """Update an existing AI agent."""
        return requests.put(
            f"{self.base_url}/api/ai-agents/{agent_id}",
            json=updates,
            headers=self.headers,
        )

    def delete_ai_agent(self, agent_id: str) -> requests.Response:
        """Delete an AI agent."""
        return requests.delete(
            f"{self.base_url}/api/ai-agents/{agent_id}", headers=self.headers
        )

    def assign_ai_agent(self, agent_id: str, instance_id: str) -> requests.Response:
        """Assign an AI agent to an instance."""
        headers = {"Authorization": f"Bearer {self.jwt_token}"} if self.jwt_token else {}
        return requests.post(
            f"{self.base_url}/api/ai-agents/{agent_id}/assign/{instance_id}",
            headers=headers,
        )

    def unassign_ai_agent(self, agent_id: str) -> requests.Response:
        """Unassign an AI agent from its instance."""
        headers = {"Authorization": f"Bearer {self.jwt_token}"} if self.jwt_token else {}
        return requests.post(
            f"{self.base_url}/api/ai-agents/{agent_id}/unassign",
            headers=headers,
        )

    def get_agent_for_instance(self, instance_id: str) -> requests.Response:
        """Get the enabled agent assigned to an instance."""
        return requests.get(
            f"{self.base_url}/api/instances/{instance_id}/ai-agent",
            headers=self.headers,
        )


def _example_usage() -> None:
    """Complete test: signup, create instance, get QR, wait for connection, send message."""

    client = ApiClient(base_url=os.getenv("API_BASE_URL", "https://raafat.koyeb.app"))
    # 2. Login to get token
    print("\nLogging in...")
    resp = client.login("refoo@gmail.com", "refoo@gmail.com")
    print("Login response:", resp.status_code)
    if resp.status_code != 200:
        print("Login failed:", resp.json())
        return

    token_data = resp.json()
    client.jwt_token = token_data["token"]
    print("Logged in successfully")

    # # 3. Create instance
    # print("\nCreating instance...")
    # resp = client.create_instance("Test Instance")
    # print("Create instance response:", resp.status_code)
    # if resp.status_code != 201:
    #     print("Create instance failed:", resp.json())
    #     return

    # instance_data = resp.json()
    instance_id = "69b4ac22f5f3e19f1d0e2036"
    print(f"Created instance: {instance_id}")

    # 4. Start instance
    print("\nStarting instance...")
    resp = client.start_instance(instance_id)
    print("Start instance response:", resp.status_code)


    # 5. Wait for QR code
    print("\nWaiting for QR code...")
    qr_code = None
    for i in range(30):  # Wait up to 30 attempts (about 30 seconds)
        resp = client.get_instance_qr(instance_id)
        if resp.status_code == 200:
            qr_data = resp.json()
            qr_code = qr_data.get("qr")
            if qr_code:
                print("QR Code generated!")
                print("Please scan this QR code with WhatsApp on your phone:")
                print(qr_code)
                break
        elif resp.status_code == 202:
            print(f"QR not ready yet... attempt {i+1}/30")
        else:
            print("Error getting QR:", resp.status_code, resp.json())
            return
        time.sleep(1)

    if not qr_code:
        print("QR code never became available")
        return

    # 6. Wait for connection
    print("\nWaiting for WhatsApp connection...")
    for i in range(60):  # Wait up to 60 seconds
        resp = client.get_instance(instance_id)
        if resp.status_code == 200:
            instance_info = resp.json()
            status = instance_info.get("status")
            print(f"Status: {status} (attempt {i+1}/60)")
            if status == "connected":
                print("WhatsApp connected successfully!")
                break
        else:
            print("Error checking status:", resp.status_code, resp.json())
            return
        time.sleep(1)

    # 7. Send test message
    print("\nSending test message...")
    resp = client.send_instance_message(
        instance_id=instance_id,
        contact_id="+201011508719",
        text="Hello! This is a test message from the deployed WhatsApp AI agent.",
    )
    print("Send message response:", resp.status_code)
    if resp.status_code == 200:
        print("Message sent successfully!")
    else:
        print("Failed to send message:", resp.json())
if __name__ == "__main__":
    _example_usage()
