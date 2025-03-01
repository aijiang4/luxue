DELETE FROM "refly"."model_infos";

INSERT INTO "refly"."model_infos"
("name", "label", "provider", "tier", "created_at", "enabled", "updated_at", "context_limit", "max_output", "capabilities")
VALUES
('deepseek-reasoner', 'Deepseek Reasoner', 'openai', 't2', now(), 't', now(), 128000, 16384, '{"vision":true}'),
('deepseek-chat', 'Deepseek Chat', 'openai', 't2', now(), 't', now(), 128000, 16384, '{"vision":true}'),
('o1-mini', 'O1 Mini', 'openai', 't2', now(), 't', now(), 128000, 16384, '{"vision":true}'),
('o1-preview', 'O1 Preview', 'openai', 't2', now(), 't', now(), 128000, 16384, '{"vision":true}'),
('LinkAI-4o-mini', 'LinkAI 4o Mini', 'openai', 't2', now(), 't', now(), 128000, 16384, '{"vision":true}'); 