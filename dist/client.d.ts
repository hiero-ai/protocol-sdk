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
export declare class HieroClient {
    private baseUrl;
    private signer;
    constructor(config: {
        baseUrl: string;
        privateKey: string;
    });
    private signRequest;
    private request;
    createAgent(agent: Agent): Promise<APIResponse<Agent>>;
    getAgent(agentId: string): Promise<APIResponse<Agent>>;
    updateAgent(agentId: string, update: Partial<Agent>): Promise<APIResponse<Agent>>;
    deleteAgent(agentId: string): Promise<APIResponse<void>>;
    listMyAgents(params?: PaginationParams): Promise<APIResponse<{
        agents: Agent[];
    }>>;
    generateAgentConfig(specification: string): Promise<APIResponse<{
        configuration: Agent;
    }>>;
    inferAgent(agentId: string, input: string, threadId: string): Promise<APIResponse<AgentInferenceResponse>>;
    createService(service: Service): Promise<APIResponse<Service>>;
    getService(serviceId: string): Promise<APIResponse<Service>>;
    updateService(serviceId: string, update: Partial<Service>): Promise<APIResponse<Service>>;
    searchServices(params?: ServiceSearchParams): Promise<APIResponse<{
        services: Service[];
    }>>;
    authorizeService(serviceId: string, authorization: Authorization): Promise<APIResponse<{
        auth_token: string;
    }>>;
}
