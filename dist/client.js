import { Wallet } from "ethers";
export class HieroClient {
    baseUrl;
    signer;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
        this.signer = new Wallet(config.privateKey);
    }
    async signRequest(method, path, body) {
        const message = body ? JSON.stringify(body) : "";
        const signature = await this.signer.signMessage(message);
        return {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${signature}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        };
    }
    async request(method, path, body) {
        try {
            const requestInit = await this.signRequest(method, path, body);
            const response = await fetch(`${this.baseUrl}${path}`, requestInit);
            const data = await response.json();
            if (!response.ok) {
                return { error: data };
            }
            return { data: data };
        }
        catch (error) {
            return {
                error: {
                    error: "Request failed",
                    details: error instanceof Error ? error.message : "Unknown error",
                },
            };
        }
    }
    // Agents API
    async createAgent(agent) {
        return this.request("POST", "/api/v1/agents", agent);
    }
    async getAgent(agentId) {
        return this.request("GET", `/api/v1/agents/${agentId}`);
    }
    async updateAgent(agentId, update) {
        return this.request("PUT", `/api/v1/agents/${agentId}`, update);
    }
    async deleteAgent(agentId) {
        return this.request("DELETE", `/api/v1/agents/${agentId}`);
    }
    async listMyAgents(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        return this.request("GET", `/api/v1/agents/me?${queryParams}`);
    }
    async generateAgentConfig(specification) {
        return this.request("POST", "/api/v1/agents/generate", { specification });
    }
    async inferAgent(agentId, input, threadId) {
        return this.request("POST", `/api/v1/agents/${agentId}/infer`, { input, threadId });
    }
    // Services API
    async createService(service) {
        return this.request("POST", "/api/v1/services", service);
    }
    async getService(serviceId) {
        return this.request("GET", `/api/v1/services/${serviceId}`);
    }
    async updateService(serviceId, update) {
        return this.request("PUT", `/api/v1/services/${serviceId}`, update);
    }
    async searchServices(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        return this.request("GET", `/api/v1/services?${queryParams}`);
    }
    async authorizeService(serviceId, authorization) {
        return this.request("POST", `/api/v1/services/${serviceId}/authorize`, authorization);
    }
}
