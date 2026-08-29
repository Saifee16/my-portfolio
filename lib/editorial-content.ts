import type { BlogPost } from "./types.ts";

export const editorialMigration = "editorial-v1";

export const editorialPosts: BlogPost[] = [
  {
    id: "reliable-rag-beyond-demo",
    slug: "reliable-rag-begins-where-the-demo-ends",
    title: "Reliable RAG Begins Where the Demo Ends",
    excerpt: "A retrieval system earns trust by knowing when evidence is insufficient, not by producing an answer for every prompt.",
    category: "Applied AI",
    tags: ["RAG", "Evaluation", "LLM systems"],
    status: "Published",
    publishedAt: "2026-08-24",
    seoTitle: "Reliable RAG Begins Where the Demo Ends",
    seoDescription: "How to design retrieval-augmented generation around evidence, abstention, and regression evaluation.",
    coverImage: "/media/editorial/01_reliable_rag_begins_where_the_demo_ends.png",
    featured: true,
    content: `# Reliable RAG begins where the demo ends

A retrieval-augmented generation demo can look convincing long before it is dependable. Put a few clean documents into a vector index, ask a question that has an obvious answer, and the model appears informed. The difficult work begins with real material: stale policies, conflicting notes, a question that spans several sources, or a question whose answer is simply not present.

The design goal I use is not "make the model answer." It is "make the system show what it knows, what supports it, and when it should stop." That framing moves RAG from a chat feature to an evidence system.

## Retrieval is a decision, not a prelude

Generation should be downstream of a retrieval decision. Before composing an answer, inspect the evidence set:

- Does it contain direct support for every important claim?
- Are the best passages mutually consistent?
- Is the query specific enough to retrieve useful context?
- Is the evidence fresh enough for the requested decision?

Embedding similarity is useful, but it is not a confidence score. A high score can be a nearby topic rather than proof. A strong pipeline usually combines lexical retrieval for exact terms, semantic retrieval for meaning, metadata filters for scope, reranking for relevance, and a final evidence-sufficiency check.

> The most valuable answer a RAG system can give is sometimes a well-explained "I could not verify that from the available sources."

## Build an evidence contract

I prefer an explicit contract between retrieval and generation. Each answerable claim should map to one or more source chunks. The interface can then show citations, source titles, document dates, and a concise reason when the system abstains. That makes a bad answer reviewable instead of mysterious.

For production work, log the query, retrieval candidates, reranker result, selected context, model output, citations, and the final disposition. The trace becomes the unit of debugging. If an answer is wrong, you can separate retrieval failure from synthesis failure instead of tuning prompts blindly.

## Evaluate the failure modes first

A useful RAG evaluation set is not just a collection of happy-path questions. It should include answerable questions, unanswerable questions, adversarial wording, document conflicts, time-sensitive questions, and queries that require careful scope handling. Track at least retrieval recall, citation correctness, claim support, abstention precision, and user-visible latency.

The [OpenAI evaluation guidance](https://platform.openai.com/docs/guides/evals) is a helpful reminder that product quality comes from a repeatable measurement loop rather than one impressive transcript. The same applies to retrieval: change an embedding model, chunking strategy, prompt, or reranker only when you can compare the result against a fixed suite.

## What changed in the PDF RAG system

The [PDF RAG Chatbot](/projects/pdf-rag-chatbot) does not index an upload inside the request that receives it. The API validates and stores the PDF, then a Celery worker handles extraction, page-aware chunks, embeddings, and indexing. That separation matters because parsing a long or scanned document has different failure and time characteristics from serving a question.

Each chunk retains its document and page provenance. That is what lets a generated answer return page-aware citations rather than a vague document name. The service also exposes retrieval without generation, so a bad result can be examined as a retrieval problem before changing the prompt.

> **Engineering decision.** The released default is hybrid retrieval: dense Qdrant candidates and PostgreSQL full-text candidates are fused with reciprocal-rank fusion. Reranking remains explicit because it adds latency and did not justify becoming the default on the checked-in synthetic fixture.

## PDFs are not plain text

Native text, scanned pages, two-column layouts, and tables do not fail in the same way. The ingestion path classifies pages, uses PyMuPDF for native extraction, and invokes local Tesseract OCR only when a page does not have enough native text. OCR work has page, document, image-pixel, output-size, and timeout bounds. OCR text and PDF pixels stay in the worker rather than being sent to a provider.

The limitation is important: OCR cannot truthfully restore layout that was not extracted. The system keeps page provenance and distinguishes native, OCR, and mixed material instead of fabricating table structure from weak coordinates.

## A concrete abstention boundary

The RAG service returns retrieval confidence, an abstained flag, and an abstention reason. If evidence is below the configured confidence gate, it returns a grounded insufficient-evidence response with no citations and skips the provider call. This is deliberately earlier than generation: a model cannot recover support that retrieval did not find.

## A practical release gate

Before I would call a RAG workflow ready for wider use, I would want the following behavior to be boring and reliable:

- Answers cite the specific evidence they rely on.
- Unsupported questions get an abstention or a request for a better source.
- Private or out-of-scope documents cannot leak through retrieval.
- A regression suite runs whenever retrieval or prompting changes.
- Operators can inspect the evidence path without reproducing a user's entire session.

That is less theatrical than a fluent demo, but it is the difference between a system that sounds informed and one that can support real work.

## Closing note

RAG is strongest when it makes the boundary of knowledge visible. A system that can say "this source supports the answer" and "this source does not" is easier to trust, easier to improve, and much safer to place in front of real decisions.

## References / further reading

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [Qdrant documentation](https://qdrant.tech/documentation/)
- [PyMuPDF documentation](https://pymupdf.readthedocs.io/)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [PDF RAG Chatbot case study](/projects/pdf-rag-chatbot)` ,
  },
  {
    id: "provider-neutral-llm-gateway",
    slug: "provider-neutral-llm-gateway-not-api-proxy",
    title: "A Provider-Neutral LLM Gateway Is Not an API Proxy",
    excerpt: "Stable aliases, explicit policy, observability, and testable fallbacks turn model calls into infrastructure.",
    category: "Backend Systems",
    tags: ["LLM infrastructure", "FastAPI", "Reliability"],
    status: "Published",
    publishedAt: "2026-08-20",
    seoTitle: "A Provider-Neutral LLM Gateway Is Not an API Proxy",
    seoDescription: "The practical architecture behind model routing, policy, fallbacks, and traceable LLM usage.",
    coverImage: "/media/editorial/02_provider_neutral_llm_gateway_not_api_proxy.png",
    featured: false,
    content: `# A provider-neutral LLM gateway is not an API proxy

Calling a model directly from an application is a good way to learn. It is not usually a durable production boundary. As soon as a product has multiple features, providers, cost constraints, or reliability expectations, every call site starts making slightly different choices about timeouts, retries, schema handling, and logging.

An LLM gateway exists to make those choices explicit once.

## Start with a stable product contract

The application should ask for a capability, not a provider-specific model string. For example, fast classification, careful analysis, and vision extraction can be product aliases that map to a policy-controlled provider and model. That gives teams room to change the implementation without rewriting every feature.

The gateway contract should normalize inputs, structured outputs, tool definitions, streaming events, and usage data. It should also preserve useful provider details in a safe diagnostic field instead of pretending every provider behaves identically.

## Routing is policy

Good routing considers more than availability. A request may need a particular modality, a low latency profile, data-handling constraints, a constrained cost envelope, or a verified structured-output capability. Make those requirements machine-readable at the boundary.

Then keep fallbacks narrow. A fallback model should be compatible with the response contract and safety expectations. "Try anything else" is not a resilience strategy. It is a way to create surprising behavior under load.

## Treat retries as a budget

Retries help with transient failure, but every retry consumes time, quota, and sometimes duplicate side effects. I prefer a short request budget with bounded attempts, jitter, cancellation propagation, idempotency where supported, and a clear final error class. Tool calls deserve even more care because replaying a write is not equivalent to replaying text generation.

The [Responses API streaming reference](https://platform.openai.com/docs/api-reference/responses-streaming) is useful context for this: streamed interaction is a sequence of stateful events, not one blob of text. A gateway should preserve that lifecycle so product teams can handle partial output and failure honestly.

## Observability is the real payoff

At minimum, record request type, selected alias, resolved model, latency, token or usage metrics, retry count, tool usage, finish reason, and a trace identifier. Avoid logging sensitive user content by default. The goal is operational evidence, not a private transcript archive.

This makes questions answerable: Did a route change increase latency? Is an expensive alias used for low-value work? Are schema failures concentrated in one feature? Is a fallback hiding an upstream incident?

## Keep the adapter layer small

The provider adapter should translate transport details. It should not become the place where business rules drift. Keep shared policy in the gateway, adapters focused on capability translation, and application code focused on the user task.

The outcome is not vendor avoidance for its own sake. It is an application that can evolve models, preserve a consistent product contract, and explain what happened when a call does not go as planned.

## What the gateway actually owns

The [LLM API Gateway](/projects/llm-api-gateway) presents a normalized FastAPI contract for chat, schema-constrained output, and embeddings. It resolves a stable alias to an ordered provider and model chain, checks the requested capability, applies a timeout, and records the attempt. Gemini and OpenAI adapters translate to and from their SDK-specific payloads; routing policy stays above them.

That boundary is useful because it keeps application code from learning provider response shapes. It also makes the failure path visible. Rate limits, timeouts, and transient server failures are retryable. Invalid requests and unsupported capabilities are not. The gateway retries the current route with bounded exponential backoff and jitter before moving to the next configured provider.

> **Key idea.** A final success is incomplete operational information if the first route failed. The gateway persists failed attempts as well as successful ones so the fallback path remains inspectable.

## Usage is not billing

The gateway normalizes input, output, and cached-input tokens, then applies a local pricing catalog to produce an estimated-cost field. That is intentionally an estimate, not invoice reconciliation. Provider billing tiers, cache rules, and product pricing can differ.

Each usage event carries a request ID, alias, provider, model, latency, retry index, status, normalized usage, and estimated cost. It is enough to answer engineering questions such as whether a fallback occurred, whether a route is producing transient errors, or whether a feature is using an unexpected alias. It is not a substitute for tenant isolation, quotas, or production authorization.

## Limits that stay outside the gateway

The gateway does not make fallback models semantically equivalent. It does not make a local development usage endpoint safe to expose publicly. Before a multi-tenant deployment, authentication, authorization, client quotas, rate limits, secret management, and tenant-aware accounting are separate product and security decisions.

## References / further reading

- [OpenAI API documentation](https://platform.openai.com/docs/overview)
- [Google Gen AI documentation](https://ai.google.dev/gemini-api/docs)
- [FastAPI documentation](https://fastapi.tiangolo.com/)
- [HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [LLM API Gateway case study](/projects/llm-api-gateway)` ,
  },
  {
    id: "debuggable-agentic-ai",
    slug: "building-agentic-ai-that-can-be-debugged",
    title: "Build Agentic AI That Can Be Debugged",
    excerpt: "An agent is a stateful workflow with tools and side effects. Design it so each decision can be inspected and bounded.",
    category: "Agentic AI",
    tags: ["Agents", "Observability", "Tool use"],
    status: "Published",
    publishedAt: "2026-08-16",
    seoTitle: "Build Agentic AI That Can Be Debugged",
    seoDescription: "A practical approach to agent loops, tool boundaries, traces, evaluations, and safe execution.",
    coverImage: "/media/editorial/03_build_agentic_ai_that_can_be_debugged.png",
    featured: false,
    content: `# Build agentic AI that can be debugged

The moment a language model can call tools, carry state, and affect a system, it is no longer just a chat response. It is a workflow. Workflows need boundaries, traces, failure handling, and tests.

The most useful mental model is simple: an agent proposes the next action, but the surrounding system owns authorization, execution, persistence, and evaluation.

## Make the loop visible

Every run should have a trace that answers five questions: what was the goal, what context was available, which tool was selected, what did the tool return, and why did the run stop? Without that chain, an agent failure turns into a vague claim that "the model got confused."

The [OpenAI Agents SDK announcement](https://openai.com/index/new-tools-for-building-agents/) highlights tracing and guardrails for exactly this reason. Observability is not decorative telemetry. It is how an operator learns whether the failure was an instruction problem, bad retrieved context, an unavailable tool, an unsafe action, or an incorrect model decision.

## Keep tools narrow and typed

A broad tool like manage customer account creates a giant ambiguity surface. Prefer small tools with schemas that reflect a real permission boundary: get invoice, draft refund request, submit refund after approval. Validate arguments on the server, return typed results, and keep writes explicit.

The model should never be the only authorization layer. It can propose a tool call, but the application should enforce identity, tenancy, rate limits, policy, and idempotency before any side effect occurs.

## Use checkpoints, not endless autonomy

Most useful agent tasks are short chains with clear stop conditions. Set a maximum number of turns, a time budget, a tool budget, and a definition of success. For consequential work, insert a human confirmation or a deterministic policy gate before committing the action.

This is also good product design. A user can understand "I found three matching records and need your approval to update one" much better than an opaque progress animation.

## Evaluate trajectories, not only answers

An answer can look good while the agent used an expensive or unsafe path to produce it. Evaluation should include tool selection, argument validity, action order, policy adherence, recovery from tool errors, and whether the run stops when it should. Keep fixtures for both successful and intentionally blocked tasks.

I like a layered release gate:

- Unit-test tool schemas and deterministic policy.
- Replay known traces against changes to prompts or models.
- Grade a small set of task trajectories.
- Review sampled production traces with sensitive data redacted.

## The useful constraint

Agents become more trustworthy when their freedom is designed, not assumed. A narrow tool surface, observable reasoning path, finite budget, and explicit handoff make the system easier to improve without pretending it is infallible.

## A debugging sequence I would actually use

Start with the smallest reproducible run. Capture the input class, permitted tools, tool arguments, tool result, state transition, and final disposition. Then ask a deterministic question at each transition: was this tool allowed, were the arguments valid, did the tool return the expected shape, and did the state machine take the permitted next step?

For example, a document assistant can propose a retrieval call, receive an empty evidence set, and stop with a request for a better source. It should not continue into answer generation merely because another model turn is available. That same boundary is used in the [PDF RAG Chatbot](/projects/pdf-rag-chatbot): insufficient retrieval evidence produces an abstention before a provider call.

> **Limitation.** A trace explains what the system did. It does not prove the decision was correct. Evaluation still needs representative tasks, blocked actions, tool failures, and reviews of whether a valid tool call was the right action.

## Keep sensitive context out of the trace

Useful traces record identifiers, decisions, durations, status, and safe summaries. They do not need to store secrets, raw credentials, or complete private documents. Logging policy is part of the tool contract, not cleanup to add after an incident.

## References / further reading

- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [OpenAI evaluations guide](https://platform.openai.com/docs/guides/evals)
- [OpenAI function calling guide](https://platform.openai.com/docs/guides/function-calling)
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [LLM API Gateway case study](/projects/llm-api-gateway)` ,
  },
  {
    id: "traffic-surveillance-research-roadmap",
    slug: "detection-to-tracking-traffic-surveillance-roadmap",
    title: "From Detection to Tracking: A Traffic-Surveillance Research Roadmap",
    excerpt: "Detection is a frame-level capability. Traffic reasoning needs temporal evidence, stable identities, and conservative claims.",
    category: "Computer Vision Research",
    tags: ["Computer vision", "Tracking", "MS-ADA"],
    status: "Published",
    publishedAt: "2026-08-12",
    seoTitle: "From Detection to Tracking: A Traffic-Surveillance Research Roadmap",
    seoDescription: "How an interpretable traffic-safety research pipeline moves from detection to temporal evidence and future vision research.",
    coverImage: "/media/editorial/04_detection_to_tracking_traffic_surveillance_roadmap.png",
    featured: false,
    content: `# From detection to tracking: a traffic-surveillance research roadmap

Object detection answers a useful but narrow question: what is visible in this frame? Traffic safety questions demand more. Did two vehicles approach one another? Did their trajectories converge? Was there a sudden change in motion? Can the system preserve enough evidence for a reviewer to understand the event?

That is why MS-ADA is designed as a temporal evidence pipeline rather than a single-model claim. Detection, tracking, optical flow, plate recognition, and event capture each contribute a different signal. The research value comes from how those signals are combined and audited.

## Stable identity changes the problem

Frame-level boxes cannot tell a credible story on their own. Persistent tracking makes it possible to measure direction, speed change, relative proximity, and post-event separation over time. Even then, identity switches and occlusions are not edge cases. They are central limitations that should be reflected in confidence and evidence design.

For a CPU-first academic prototype, interpretable signals are especially valuable. A deterministic temporal rule can be inspected, stress-tested, and improved when it produces a false alert. That is often a better research foundation than an opaque score with no explanation.

## Evidence is part of the model output

An alert should be accompanied by the frames, short clip, trajectories, timestamps, and contributing signals that made it worthy of review. The system should describe an event as a candidate for human review, not a final legal or safety conclusion.

This distinction protects both the research and the people represented in the footage. It keeps the claim proportional to the evidence: a prototype can surface plausible incidents and preserve context, while still being explicit about deployment limits, data diversity, and evaluation scope.

## Where newer foundation models may help

Vision foundation models widen the research options. Meta's [SAM 3](https://ai.meta.com/research/sam3/) supports promptable detection, segmentation, and tracking in images and video. [DINOv3](https://ai.meta.com/blog/dinov3-self-supervised-vision-model/) shows how strong frozen visual features can support downstream dense tasks with lightweight adaptation. Neither removes the need for local validation, but both are interesting routes for improving masks, associations, and domain transfer.

The research question is not simply "which model is newest?" It is whether a model improves the evidence pipeline under the actual constraints: video quality, camera angle, computing budget, failure recovery, and reviewer understanding.

## A responsible next phase

Future work should evaluate scenes with diverse lighting, weather, density, camera positions, and local traffic behavior. It should measure detection and tracking quality separately from event-reasoning precision. It should also compare false alerts, missed events, latency, and the clarity of the generated evidence package.

The goal is a defensible research system: one that makes its inputs, temporal signals, uncertainty, and limitations visible. That is more valuable than promising universal accident detection before the evidence exists.

## The MS-ADA pipeline in practice

The [MS-ADA case study](/projects/ms-ada) combines YOLO11 detection, persistent tracking, ALPR, optical-flow signals, and evidence outputs. Its accident reasoning is deliberately multi-signal: contact or proximity, relative motion, deceleration, trajectory convergence, and optical-flow change are considered over time. A candidate event triggers preservation of processed video, snapshots or clips, and event records for review.

That is a stronger engineering posture than treating a single overlapping box as an accident. Overlap can be caused by perspective, occlusion, or an ID switch. The output is therefore an event candidate with evidence, not a confirmed incident or a claim of universal accuracy.

> **Research boundary.** The canonical reviewed run is evidence for the prototype and its regression behavior. It is not a claim about every road, camera angle, weather condition, or traffic pattern.

## Tracking is where the assumptions surface

Persistent IDs make trajectory and deceleration features possible, but they can fail during occlusion, crowding, and appearance changes. Plate recognition is useful evidence when readable; it is not guaranteed identification. These are exactly the places where a human-reviewed ground-truth set and explicit false-positive analysis matter more than a headline accuracy number.

## References / further reading

- [Ultralytics YOLO documentation](https://docs.ultralytics.com/)
- [ByteTrack: Multi-Object Tracking by Associating Every Detection Box](https://arxiv.org/abs/2110.06864)
- [OpenCV optical flow documentation](https://docs.opencv.org/4.x/d4/dee/tutorial_optical_flow.html)
- [MS-ADA Intelligent Traffic Surveillance case study](/projects/ms-ada)` ,
  },
];
