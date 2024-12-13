import { Signer, Wallet } from "ethers";

export type Agent = {
  id: string;
  name: string;
  description: string;
  configuration: {
    prompt: string;
    model: string;
  };
};

export type Service = {
  id: string;
  name: string;
  pricing: {
    pricing_type: "per_call" | "per_token";
    price_amount: string;
    payment_address: string;
  };
  description: string;
  endpoint: string;
  input_schema: unknown;
  return_schema: unknown;
};

export type Authorization = {
  service_id: string;
  signature: string;
};

// Only define SDK-specific types here

export interface APIErrorResponse {
  error: string;
  details?: unknown;
}

export interface APIResponse<T> {
  data?: T;
  error?: APIErrorResponse;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ServiceSearchParams extends PaginationParams {
  q?: string;
  maxPrice?: number;
}

export interface AgentInferenceResponse {
  result: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: string;
  };
  metadata: {
    timestamp: string;
    latency: number;
  };
}

export class HieroClient {
  private baseUrl: string;
  private signer: Signer;

  constructor(config: { baseUrl: string; privateKey: string }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.signer = new Wallet(config.privateKey);
  }

  private async signRequest(
    method: string,
    path: string,
    body?: unknown
  ): Promise<RequestInit> {
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

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<APIResponse<T>> {
    try {
      const requestInit = await this.signRequest(method, path, body);
      const response = await fetch(`${this.baseUrl}${path}`, requestInit);
      const data = await response.json();

      if (!response.ok) {
        return { error: data as APIResponse<T>["error"] };
      }

      return { data: data as T };
    } catch (error) {
      return {
        error: {
          error: "Request failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  // Agents API
  async createAgent(agent: Agent): Promise<APIResponse<Agent>> {
    return this.request<Agent>("POST", "/api/v1/agents", agent);
  }

  async getAgent(agentId: string): Promise<APIResponse<Agent>> {
    return this.request<Agent>("GET", `/api/v1/agents/${agentId}`);
  }

  async updateAgent(
    agentId: string,
    update: Partial<Agent>
  ): Promise<APIResponse<Agent>> {
    return this.request<Agent>("PUT", `/api/v1/agents/${agentId}`, update);
  }

  async deleteAgent(agentId: string): Promise<APIResponse<void>> {
    return this.request<void>("DELETE", `/api/v1/agents/${agentId}`);
  }

  async listMyAgents(
    params?: PaginationParams
  ): Promise<APIResponse<{ agents: Agent[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request<{ agents: Agent[] }>(
      "GET",
      `/api/v1/agents/me?${queryParams}`
    );
  }

  async generateAgentConfig(
    specification: string
  ): Promise<APIResponse<{ configuration: Agent }>> {
    return this.request<{ configuration: Agent }>(
      "POST",
      "/api/v1/agents/generate",
      { specification }
    );
  }

  async inferAgent(
    agentId: string,
    input: string,
    threadId: string
  ): Promise<APIResponse<AgentInferenceResponse>> {
    return this.request<AgentInferenceResponse>(
      "POST",
      `/api/v1/agents/${agentId}/infer`,
      { input, threadId }
    );
  }

  // Services API
  async createService(service: Service): Promise<APIResponse<Service>> {
    return this.request<Service>("POST", "/api/v1/services", service);
  }

  async getService(serviceId: string): Promise<APIResponse<Service>> {
    return this.request<Service>("GET", `/api/v1/services/${serviceId}`);
  }

  async updateService(
    serviceId: string,
    update: Partial<Service>
  ): Promise<APIResponse<Service>> {
    return this.request<Service>(
      "PUT",
      `/api/v1/services/${serviceId}`,
      update
    );
  }

  async searchServices(
    params?: ServiceSearchParams
  ): Promise<APIResponse<{ services: Service[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request<{ services: Service[] }>(
      "GET",
      `/api/v1/services?${queryParams}`
    );
  }

  async authorizeService(
    serviceId: string,
    authorization: Authorization
  ): Promise<APIResponse<{ auth_token: string }>> {
    return this.request<{ auth_token: string }>(
      "POST",
      `/api/v1/services/${serviceId}/authorize`,
      authorization
    );
  }
}
