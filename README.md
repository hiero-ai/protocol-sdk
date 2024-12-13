# Hiero Protocol SDK

TypeScript/JavaScript SDK for interacting with the Hiero Protocol API.

## Installation

```bash
yarn add @hiero/protocol-sdk
```

## Usage

```typescript
import { HieroClient } from "@hiero/protocol-sdk";

// Initialize the client
const client = new HieroClient({
  baseUrl: "https://api.hiero.xyz",
  privateKey: "0x...", // Your wallet private key
});

// Example: Create an agent
const createAgent = async () => {
  const response = await client.createAgent({
    name: "My Agent",
    description: "A helpful AI agent",
    configuration: {
      model: "gpt-4",
      prompt: "You are a helpful assistant...",
    },
  });

  if (response.error) {
    console.error("Failed to create agent:", response.error);
    return;
  }

  console.log("Agent created:", response.data);
};

// Example: Use agent inference
const useAgent = async (agentId: string) => {
  const response = await client.inferAgent(
    agentId,
    "Hello, can you help me?",
    "thread_123"
  );

  if (response.error) {
    console.error("Inference failed:", response.error);
    return;
  }

  console.log("Agent response:", response.data.result);
  console.log("Usage metrics:", response.data.usage);
  console.log("Metadata:", response.data.metadata);
};
```

## API Reference

### Agents

- `createAgent(agent: CreateAgentT)`: Create a new agent
- `getAgent(agentId: string)`: Get agent details
- `updateAgent(agentId: string, update: Partial<CreateAgentT>)`: Update agent
- `deleteAgent(agentId: string)`: Delete agent
- `listMyAgents(params?: PaginationParams)`: List your agents
- `generateAgentConfig(specification: string)`: Generate agent configuration
- `inferAgent(agentId: string, input: string, threadId: string)`: Use agent inference

### Services

- `createService(service: CreateServiceT)`: Create a new service
- `getService(serviceId: string)`: Get service details
- `updateService(serviceId: string, update: Partial<CreateServiceT>)`: Update service
- `searchServices(params?: ServiceSearchParams)`: Search available services
- `authorizeService(serviceId: string, authorization: Authorization)`: Authorize service usage

## Error Handling

All methods return an `APIResponse<T>` type which includes either a `data` or an `error` property:

```typescript
interface APIResponse<T> {
  data?: T;
  error?: {
    error: string;
    details?: unknown;
  };
}
```

## Types

The SDK exports the following types for TypeScript users:

```typescript
import type {
  Agent,
  Service,
  Authorization,
  APIResponse,
  PaginationParams,
  ServiceSearchParams,
  AgentInferenceResponse,
} from "@hiero/protocol-sdk";

// Agent type structure
interface Agent {
  id: string;
  name: string;
  description: string;
  configuration: {
    prompt: string;
    model: string;
  };
}

// Service type structure
interface Service {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  pricing: {
    pricing_type: "per_call" | "per_token";
    price_amount: string;
    payment_address: string;
  };
  input_schema: unknown;
  return_schema: unknown;
}

// Inference response structure
interface AgentInferenceResponse {
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
```

## Requirements

- Node.js 16 or higher
- A Web3 wallet for signing requests

## License

MIT
