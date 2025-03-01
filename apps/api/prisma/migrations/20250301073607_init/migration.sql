-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('waiting', 'executing', 'finish', 'failed');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('ai', 'human', 'system');

-- CreateTable
CREATE TABLE "accounts" (
    "pk" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "scope" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "verification_sessions" (
    "pk" BIGSERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hashed_password" TEXT,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_sessions_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "users" (
    "pk" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "email" TEXT,
    "avatar" TEXT,
    "email_verified" TIMESTAMPTZ,
    "password" TEXT,
    "ui_locale" TEXT,
    "output_locale" TEXT,
    "has_beta_access" BOOLEAN NOT NULL DEFAULT true,
    "preferences" TEXT,
    "onboarding" TEXT,
    "customer_id" TEXT,
    "subscription_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "action_results" (
    "pk" BIGSERIAL NOT NULL,
    "result_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "uid" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "tier" TEXT NOT NULL DEFAULT '',
    "model_name" TEXT,
    "target_type" TEXT,
    "target_id" TEXT,
    "action_meta" TEXT,
    "input" TEXT,
    "context" TEXT,
    "tpl_config" TEXT,
    "history" TEXT,
    "errors" TEXT,
    "locale" TEXT DEFAULT '',
    "status" "ActionStatus" NOT NULL DEFAULT 'waiting',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_results_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "action_steps" (
    "pk" BIGSERIAL NOT NULL,
    "result_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reasoning_content" TEXT,
    "structured_data" TEXT NOT NULL DEFAULT '{}',
    "logs" TEXT NOT NULL DEFAULT '[]',
    "artifacts" TEXT NOT NULL DEFAULT '[]',
    "token_usage" TEXT NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "action_steps_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "token_usages" (
    "pk" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "result_id" TEXT,
    "tier" TEXT NOT NULL,
    "model_provider" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "input_tokens" INTEGER NOT NULL DEFAULT 0,
    "output_tokens" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_usages_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "static_files" (
    "pk" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "storage_size" BIGINT NOT NULL DEFAULT 0,
    "content_type" TEXT NOT NULL DEFAULT '',
    "processed_image_key" TEXT,
    "entity_id" TEXT,
    "entity_type" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "expired_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "static_files_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "canvases" (
    "pk" BIGSERIAL NOT NULL,
    "canvas_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "storage_size" BIGINT NOT NULL DEFAULT 0,
    "state_storage_key" TEXT,
    "share_code" TEXT,
    "read_only" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "canvases_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "canvas_entity_relations" (
    "pk" BIGSERIAL NOT NULL,
    "canvas_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "canvas_entity_relations_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "file_parse_records" (
    "pk" BIGSERIAL NOT NULL,
    "resource_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "parser" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "num_pages" INTEGER NOT NULL DEFAULT 0,
    "storage_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_parse_records_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "resources" (
    "pk" BIGSERIAL NOT NULL,
    "resource_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL DEFAULT '',
    "uid" TEXT NOT NULL,
    "word_count" INTEGER NOT NULL DEFAULT 0,
    "content_preview" TEXT,
    "storage_key" TEXT,
    "storage_size" BIGINT NOT NULL DEFAULT 0,
    "vector_size" BIGINT NOT NULL DEFAULT 0,
    "raw_file_key" TEXT,
    "index_status" TEXT NOT NULL DEFAULT 'init',
    "index_error" TEXT,
    "title" TEXT NOT NULL,
    "identifier" TEXT,
    "meta" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "documents" (
    "pk" BIGSERIAL NOT NULL,
    "doc_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "word_count" INTEGER NOT NULL DEFAULT 0,
    "content_preview" TEXT,
    "storage_key" TEXT,
    "storage_size" BIGINT NOT NULL DEFAULT 0,
    "vector_size" BIGINT NOT NULL DEFAULT 0,
    "state_storage_key" TEXT NOT NULL DEFAULT '',
    "share_code" TEXT,
    "read_only" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "references" (
    "pk" BIGSERIAL NOT NULL,
    "reference_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "references_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "skill_instances" (
    "pk" BIGSERIAL NOT NULL,
    "skill_id" TEXT NOT NULL,
    "tpl_name" TEXT NOT NULL DEFAULT '',
    "display_name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '{}',
    "uid" TEXT NOT NULL,
    "invocation_config" TEXT,
    "config_schema" TEXT,
    "tpl_config" TEXT,
    "pinned_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "skill_instances_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "skill_triggers" (
    "pk" BIGSERIAL NOT NULL,
    "display_name" TEXT NOT NULL DEFAULT '',
    "trigger_id" TEXT NOT NULL,
    "trigger_type" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "simple_event_name" TEXT,
    "timer_config" TEXT,
    "input" TEXT,
    "context" TEXT,
    "tpl_config" TEXT,
    "enabled" BOOLEAN NOT NULL,
    "bull_job_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "skill_triggers_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "label_classes" (
    "pk" BIGSERIAL NOT NULL,
    "label_class_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "label_classes_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "label_instances" (
    "pk" BIGSERIAL NOT NULL,
    "label_id" TEXT NOT NULL,
    "label_class_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "label_instances_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "pk" BIGSERIAL NOT NULL,
    "plan_type" TEXT NOT NULL,
    "interval" TEXT,
    "lookup_key" TEXT NOT NULL,
    "t1_count_quota" INTEGER NOT NULL DEFAULT 0,
    "t2_count_quota" INTEGER NOT NULL DEFAULT 0,
    "t1_token_quota" INTEGER NOT NULL DEFAULT 0,
    "t2_token_quota" INTEGER NOT NULL DEFAULT 1000000,
    "file_count_quota" INTEGER NOT NULL DEFAULT 10,
    "object_storage_quota" BIGINT NOT NULL DEFAULT 1000000000,
    "vector_storage_quota" BIGINT NOT NULL DEFAULT 1000000000,
    "file_parse_page_limit" INTEGER NOT NULL DEFAULT -1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "pk" BIGSERIAL NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "lookup_key" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "interval" TEXT,
    "uid" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "is_trial" BOOLEAN NOT NULL DEFAULT false,
    "cancel_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "token_usage_meters" (
    "pk" BIGSERIAL NOT NULL,
    "meter_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "subscription_id" TEXT,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ,
    "t1_count_quota" INTEGER NOT NULL DEFAULT 0,
    "t1_count_used" INTEGER NOT NULL DEFAULT 0,
    "t1_token_quota" INTEGER NOT NULL DEFAULT 0,
    "t1_token_used" INTEGER NOT NULL DEFAULT 0,
    "t2_count_quota" INTEGER NOT NULL DEFAULT 0,
    "t2_count_used" INTEGER NOT NULL DEFAULT 0,
    "t2_token_quota" INTEGER NOT NULL DEFAULT 0,
    "t2_token_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "token_usage_meters_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "storage_usage_meters" (
    "pk" BIGSERIAL NOT NULL,
    "meter_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "subscription_id" TEXT,
    "file_count_quota" INTEGER NOT NULL DEFAULT 10,
    "file_count_used" INTEGER NOT NULL DEFAULT 0,
    "object_storage_quota" BIGINT NOT NULL DEFAULT 0,
    "resource_size" BIGINT NOT NULL DEFAULT 0,
    "canvas_size" BIGINT NOT NULL DEFAULT 0,
    "document_size" BIGINT NOT NULL DEFAULT 0,
    "file_size" BIGINT NOT NULL DEFAULT 0,
    "vector_storage_quota" BIGINT NOT NULL DEFAULT 0,
    "vector_storage_used" BIGINT NOT NULL DEFAULT 0,
    "synced_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "storage_usage_meters_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "model_infos" (
    "pk" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "context_limit" INTEGER NOT NULL DEFAULT 0,
    "max_output" INTEGER NOT NULL DEFAULT 0,
    "capabilities" TEXT NOT NULL DEFAULT '{}',
    "tier" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_infos_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "pk" BIGSERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "lookup_key" TEXT NOT NULL,
    "payment_status" TEXT,
    "subscription_id" TEXT,
    "invoice_id" TEXT,
    "customer_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "pk" BIGSERIAL NOT NULL,
    "jti" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "hashed_token" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_sessions_session_id_key" ON "verification_sessions"("session_id");

-- CreateIndex
CREATE INDEX "verification_sessions_email_code_idx" ON "verification_sessions"("email", "code");

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "action_results_target_type_target_id_idx" ON "action_results"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "action_results_result_id_version_key" ON "action_results"("result_id", "version");

-- CreateIndex
CREATE INDEX "action_steps_result_id_version_order_idx" ON "action_steps"("result_id", "version", "order");

-- CreateIndex
CREATE INDEX "token_usages_uid_created_at_idx" ON "token_usages"("uid", "created_at");

-- CreateIndex
CREATE INDEX "static_files_entity_id_entity_type_idx" ON "static_files"("entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "static_files_storage_key_idx" ON "static_files"("storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "canvases_canvas_id_key" ON "canvases"("canvas_id");

-- CreateIndex
CREATE INDEX "canvases_uid_updated_at_idx" ON "canvases"("uid", "updated_at");

-- CreateIndex
CREATE INDEX "canvases_share_code_idx" ON "canvases"("share_code");

-- CreateIndex
CREATE INDEX "canvas_entity_relations_canvas_id_deleted_at_idx" ON "canvas_entity_relations"("canvas_id", "deleted_at");

-- CreateIndex
CREATE INDEX "canvas_entity_relations_entity_type_entity_id_deleted_at_idx" ON "canvas_entity_relations"("entity_type", "entity_id", "deleted_at");

-- CreateIndex
CREATE INDEX "file_parse_records_uid_created_at_idx" ON "file_parse_records"("uid", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "resources_resource_id_key" ON "resources"("resource_id");

-- CreateIndex
CREATE INDEX "resources_uid_identifier_deleted_at_updated_at_idx" ON "resources"("uid", "identifier", "deleted_at", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "documents_doc_id_key" ON "documents"("doc_id");

-- CreateIndex
CREATE INDEX "documents_uid_deleted_at_updated_at_idx" ON "documents"("uid", "deleted_at", "updated_at");

-- CreateIndex
CREATE INDEX "documents_share_code_idx" ON "documents"("share_code");

-- CreateIndex
CREATE UNIQUE INDEX "references_reference_id_key" ON "references"("reference_id");

-- CreateIndex
CREATE INDEX "references_source_type_source_id_idx" ON "references"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "references_target_type_target_id_idx" ON "references"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "references_source_type_source_id_target_type_target_id_key" ON "references"("source_type", "source_id", "target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_instances_skill_id_key" ON "skill_instances"("skill_id");

-- CreateIndex
CREATE INDEX "skill_instances_uid_updated_at_idx" ON "skill_instances"("uid", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "skill_triggers_trigger_id_key" ON "skill_triggers"("trigger_id");

-- CreateIndex
CREATE INDEX "skill_triggers_skill_id_deleted_at_idx" ON "skill_triggers"("skill_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "label_classes_label_class_id_key" ON "label_classes"("label_class_id");

-- CreateIndex
CREATE INDEX "label_classes_uid_deleted_at_updated_at_idx" ON "label_classes"("uid", "deleted_at", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "label_classes_uid_name_key" ON "label_classes"("uid", "name");

-- CreateIndex
CREATE UNIQUE INDEX "label_instances_label_id_key" ON "label_instances"("label_id");

-- CreateIndex
CREATE INDEX "label_instances_entity_type_entity_id_idx" ON "label_instances"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_plan_type_interval_key" ON "subscription_plans"("plan_type", "interval");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscription_id_key" ON "subscriptions"("subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_uid_idx" ON "subscriptions"("uid");

-- CreateIndex
CREATE INDEX "subscriptions_status_cancel_at_idx" ON "subscriptions"("status", "cancel_at");

-- CreateIndex
CREATE UNIQUE INDEX "token_usage_meters_meter_id_key" ON "token_usage_meters"("meter_id");

-- CreateIndex
CREATE INDEX "token_usage_meters_uid_deleted_at_idx" ON "token_usage_meters"("uid", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "storage_usage_meters_meter_id_key" ON "storage_usage_meters"("meter_id");

-- CreateIndex
CREATE INDEX "storage_usage_meters_uid_deleted_at_idx" ON "storage_usage_meters"("uid", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "model_infos_name_key" ON "model_infos"("name");

-- CreateIndex
CREATE INDEX "checkout_sessions_session_id_idx" ON "checkout_sessions"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_jti_key" ON "refresh_tokens"("jti");

-- CreateIndex
CREATE INDEX "refresh_tokens_uid_idx" ON "refresh_tokens"("uid");

-- AddForeignKey
ALTER TABLE "label_instances" ADD CONSTRAINT "label_instances_label_class_id_fkey" FOREIGN KEY ("label_class_id") REFERENCES "label_classes"("label_class_id") ON DELETE RESTRICT ON UPDATE CASCADE;
