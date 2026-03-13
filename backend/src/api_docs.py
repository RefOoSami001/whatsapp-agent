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
    """Example usage of this client.

    Notes:
        - Replace values with real credentials.
        - This function is for documentation/demo purposes only.
    """
    client = ApiClient(base_url=os.getenv("API_BASE_URL", "http://localhost:4000"))

    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWI0NjQzZWJiNTlmOWU4Mjk2YzBjYTYiLCJpYXQiOjE3NzM0NDAyNDQsImV4cCI6MTc3NDA0NTA0NH0.0-z44X_681rpmWUexls23duxHFYm3I3YR2_GgP8qcKw"

    client.jwt_token = token

    # # Start the instance
    # resp = client.start_instance("69b48dcfdf43d44ceb1cc47f")
    # print("Start instance response:", resp.status_code, resp.json())

    # # Get QR code for connection
    # resp = client.get_instance_qr('69b48dcfdf43d44ceb1cc47f')
    # print("Get instance QR response:", resp.status_code, resp.json())
    # if resp.status_code == 200:
    #     qr_data = resp.json()
    #     print("QR Code:", qr_data.get('qr'))
    #     print("Please scan the QR code with WhatsApp on your phone.")
    #     input("Press Enter after scanning the QR code...")

    # # Wait a bit for connection to establish
    # input("Press Enter after the instance shows as connected...")

    # Send a test message
    resp = client.send_instance_message(
        instance_id="69b48dcfdf43d44ceb1cc47f",
        contact_id="+201011508719",
        text="Hello from the API client!",
    )
    print("Send message response:", resp.status_code, resp.json())
if __name__ == "__main__":
    _example_usage()
