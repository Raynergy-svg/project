

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."application_status" AS ENUM (
    'pending',
    'reviewing',
    'interviewed',
    'offered',
    'rejected',
    'accepted',
    'withdrawn'
);


ALTER TYPE "public"."application_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_chat_sessions"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Function logic to clean up old chat sessions here
END;
$$;


ALTER FUNCTION "public"."cleanup_old_chat_sessions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_email_confirmation_procedure"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  -- Create the procedure to confirm a user's email
  CREATE OR REPLACE FUNCTION manually_confirm_user(user_id UUID)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $inner$
  BEGIN
    -- Update the user's confirmation status
    UPDATE auth.users
    SET email_confirmed_at = now(),
        confirmed_at = now()
    WHERE id = user_id;
  END;
  $inner$;

  -- Grant execute permission to the service_role
  GRANT EXECUTE ON FUNCTION manually_confirm_user(UUID) TO service_role;
END;
$_$;


ALTER FUNCTION "public"."create_email_confirmation_procedure"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."execute_sql"("sql" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;


ALTER FUNCTION "public"."execute_sql"("sql" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."execute_sql"("sql" "text") IS 'Execute arbitrary SQL statements with proper security context';



CREATE OR REPLACE FUNCTION "public"."get_table_statistics"("table_name" "text") RETURNS TABLE("row_count" bigint, "total_size" "text", "index_size" "text", "vacuum_count" bigint, "last_vacuum" timestamp without time zone)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT reltuples::BIGINT FROM pg_class WHERE relname = table_name) AS row_count,
        pg_size_pretty(pg_total_relation_size(table_name::regclass)) AS total_size,
        pg_size_pretty(pg_indexes_size(table_name::regclass)) AS index_size,
        n_vacuum AS vacuum_count,
        last_vacuum
    FROM pg_stat_user_tables
    WHERE relname = table_name;
END;
$$;


ALTER FUNCTION "public"."get_table_statistics"("table_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Your function logic here
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.profiles
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_user_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_update_v2"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    UPDATE public.profiles
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_user_update_v2"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_security_event"("p_user_id" "uuid" DEFAULT NULL::"uuid", "p_event_type" "text" DEFAULT 'unknown'::"text", "p_ip_address" "text" DEFAULT NULL::"text", "p_user_agent" "text" DEFAULT NULL::"text", "p_email" "text" DEFAULT NULL::"text", "p_details" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result_id bigint;
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    ip_address,
    user_agent,
    email,
    details
  ) VALUES (
    p_user_id,
    p_event_type,
    p_ip_address,
    p_user_agent,
    p_email,
    p_details
  )
  RETURNING id INTO result_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'id', result_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;


ALTER FUNCTION "public"."insert_security_event"("p_user_id" "uuid", "p_event_type" "text", "p_ip_address" "text", "p_user_agent" "text", "p_email" "text", "p_details" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."insert_security_event"("p_user_id" "uuid", "p_event_type" "text", "p_ip_address" "text", "p_user_agent" "text", "p_email" "text", "p_details" "jsonb") IS 'Records security events such as login attempts and security-related actions';



CREATE OR REPLACE FUNCTION "public"."pg_get_coldef"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    -- Function logic here
END;
$$;


ALTER FUNCTION "public"."pg_get_coldef"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_user_consent"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    -- Function logic goes here
END;
$$;


ALTER FUNCTION "public"."record_user_consent"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_user_consent"("p_user_id" "uuid", "p_consent_type" character varying, "p_consent_given" boolean, "p_consent_version" character varying, "p_consent_method" character varying, "p_ip_address" character varying DEFAULT NULL::character varying, "p_user_agent" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_consent_id UUID;
BEGIN
  INSERT INTO user_consent_records (
    user_id,
    consent_type,
    consent_given,
    consent_version,
    consent_method,
    ip_address,
    user_agent,
    metadata,
    updated_at
  ) VALUES (
    p_user_id,
    p_consent_type,
    p_consent_given,
    p_consent_version,
    p_consent_method,
    p_ip_address,
    p_user_agent,
    p_metadata,
    now()
  )
  RETURNING id INTO v_consent_id;
  
  RETURN v_consent_id;
END;
$$;


ALTER FUNCTION "public"."record_user_consent"("p_user_id" "uuid", "p_consent_type" character varying, "p_consent_given" boolean, "p_consent_version" character varying, "p_consent_method" character varying, "p_ip_address" character varying, "p_user_agent" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_account_statistics"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    -- Function logic goes here
END;
$$;


ALTER FUNCTION "public"."refresh_account_statistics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."security_execute_sql"("sql" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result json;
BEGIN
  EXECUTE sql INTO result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;


ALTER FUNCTION "public"."security_execute_sql"("sql" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."security_execute_sql"("sql" "text") IS 'Function for security auditing - executes SQL with named parameter and returns JSON result';



CREATE OR REPLACE FUNCTION "public"."update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "is_premium" boolean DEFAULT false,
    "trial_ends_at" timestamp with time zone,
    "subscription" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_sign_in_at" timestamp with time zone,
    "raw_app_meta_data" "jsonb",
    "raw_user_meta_data" "jsonb"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stripe_customer_id" "text" NOT NULL,
    "stripe_subscription_id" "text" NOT NULL,
    "status" "text" NOT NULL,
    "plan_id" "text" NOT NULL,
    "price_id" "text",
    "quantity" integer,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone NOT NULL,
    "cancel_at_period_end" boolean DEFAULT false NOT NULL,
    "cancel_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "trial_start" timestamp with time zone,
    "trial_end" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "last_payment_date" timestamp with time zone,
    "last_payment_error" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."account_deletion_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "requested_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "scheduled_deletion_date" timestamp with time zone NOT NULL,
    "reason" "text",
    "status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "completed_at" timestamp with time zone,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."account_deletion_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bank_accounts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "balance" numeric(15,2) NOT NULL,
    "institution" "text" NOT NULL,
    "account_number" "text",
    "plaid_item_id" "text",
    "plaid_account_id" "text",
    "institution_id" "text",
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bank_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "account_id" "uuid" NOT NULL,
    "amount" numeric(15,2) NOT NULL,
    "transaction_type" "text" NOT NULL,
    "description" "text",
    "transaction_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb",
    CONSTRAINT "valid_transaction_type" CHECK (("transaction_type" = ANY (ARRAY['debit'::"text", 'credit'::"text", 'transfer'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."account_statistics" AS
 SELECT "ba"."id" AS "account_id",
    "ba"."user_id",
    "ba"."type",
    "count"("t"."id") AS "total_transactions",
    "sum"(
        CASE
            WHEN ("t"."transaction_type" = 'credit'::"text") THEN "t"."amount"
            ELSE (0)::numeric
        END) AS "total_credits",
    "sum"(
        CASE
            WHEN ("t"."transaction_type" = 'debit'::"text") THEN "t"."amount"
            ELSE (0)::numeric
        END) AS "total_debits",
    "max"("t"."transaction_date") AS "last_transaction_date"
   FROM ("public"."bank_accounts" "ba"
     LEFT JOIN "public"."transactions" "t" ON (("ba"."id" = "t"."account_id")))
  GROUP BY "ba"."id", "ba"."user_id", "ba"."type"
  WITH NO DATA;


ALTER TABLE "public"."account_statistics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."password_reset_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used_at" timestamp with time zone,
    CONSTRAINT "token_not_expired" CHECK (("expires_at" > "now"()))
);


ALTER TABLE "public"."password_reset_tokens" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_password_reset_tokens" WITH ("security_invoker"='on') AS
 SELECT "password_reset_tokens"."id",
    "password_reset_tokens"."user_id",
    "password_reset_tokens"."token",
    "password_reset_tokens"."created_at",
    "password_reset_tokens"."expires_at",
    "password_reset_tokens"."used_at"
   FROM "public"."password_reset_tokens"
  WHERE (("password_reset_tokens"."used_at" IS NULL) AND ("password_reset_tokens"."expires_at" > "now"()));


ALTER TABLE "public"."active_password_reset_tokens" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_subscriptions" WITH ("security_invoker"='on') AS
 SELECT "s"."id",
    "s"."user_id",
    "s"."stripe_customer_id",
    "s"."stripe_subscription_id",
    "s"."status",
    "s"."plan_id",
    "s"."price_id",
    "s"."quantity",
    "s"."current_period_start",
    "s"."current_period_end",
    "s"."cancel_at_period_end",
    "s"."cancel_at",
    "s"."canceled_at",
    "s"."trial_start",
    "s"."trial_end",
    "s"."ended_at",
    "s"."last_payment_date",
    "s"."last_payment_error",
    "s"."created_at",
    "s"."updated_at",
    "au"."email",
    "p"."name" AS "full_name"
   FROM (("public"."subscriptions" "s"
     JOIN "public"."profiles" "p" ON (("s"."user_id" = "p"."id")))
     JOIN "auth"."users" "au" ON (("s"."user_id" = "au"."id")))
  WHERE (("s"."status" = 'active'::"text") AND ("s"."current_period_end" > "now"()));


ALTER TABLE "public"."active_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "role" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chat_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text"])))
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."chat_messages" IS 'Stores chat messages between users and the AI assistant';



COMMENT ON COLUMN "public"."chat_messages"."id" IS 'Unique identifier for the message';



COMMENT ON COLUMN "public"."chat_messages"."user_id" IS 'User who sent or received the message';



COMMENT ON COLUMN "public"."chat_messages"."session_id" IS 'Unique identifier for the chat session';



COMMENT ON COLUMN "public"."chat_messages"."content" IS 'Message content';



COMMENT ON COLUMN "public"."chat_messages"."role" IS 'Role of the message sender (user or assistant)';



COMMENT ON COLUMN "public"."chat_messages"."timestamp" IS 'Time the message was sent';



COMMENT ON COLUMN "public"."chat_messages"."metadata" IS 'Additional metadata for the message, like AI confidence score';



CREATE TABLE IF NOT EXISTS "public"."cookie_consent_preferences" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "necessary" boolean DEFAULT true NOT NULL,
    "functional" boolean DEFAULT false NOT NULL,
    "analytics" boolean DEFAULT false NOT NULL,
    "marketing" boolean DEFAULT false NOT NULL,
    "third_party" boolean DEFAULT false NOT NULL,
    "consent_timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "consent_version" character varying(100) NOT NULL,
    "ip_address" character varying(45),
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."cookie_consent_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."data_export_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "requested_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "export_format" character varying(50) DEFAULT 'json'::character varying NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "completed_at" timestamp with time zone,
    "exported_file_path" "text",
    "exported_file_size" integer,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."data_export_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."debts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "amount" numeric(15,2) NOT NULL,
    "interest_rate" numeric(6,2) NOT NULL,
    "minimum_payment" numeric(15,2) NOT NULL,
    "due_date" "date",
    "notes" "text",
    "priority" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "institution_id" "text",
    "account_id" "text",
    "plaid_item_id" "text",
    "last_updated_from_bank" timestamp with time zone
);


ALTER TABLE "public"."debts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "linkedin_url" "text",
    "portfolio_url" "text",
    "cover_letter" "text" NOT NULL,
    "position" "text" NOT NULL,
    "department" "text" NOT NULL,
    "resume_url" "text",
    "status" "public"."application_status" DEFAULT 'pending'::"public"."application_status" NOT NULL,
    "applied_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    "interviewer_id" "uuid",
    "interview_feedback" "text",
    "interview_date" timestamp with time zone
);


ALTER TABLE "public"."job_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."migration_log" (
    "id" integer NOT NULL,
    "migration_name" "text",
    "executed_at" timestamp with time zone DEFAULT "now"(),
    "status" "text",
    "details" "text"
);


ALTER TABLE "public"."migration_log" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."migration_log_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."migration_log_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."migration_log_id_seq" OWNED BY "public"."migration_log"."id";



CREATE TABLE IF NOT EXISTS "public"."security_audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_type" "text" NOT NULL,
    "user_id" "text",
    "ip_address" "text",
    "user_agent" "text",
    "details" "jsonb",
    "severity" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_severity" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."security_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_events" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "email" "text",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."security_events" OWNER TO "postgres";


ALTER TABLE "public"."security_events" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."security_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."support_tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "message" "text" NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "category" "text",
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "attachments" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resolved_at" timestamp with time zone,
    "assigned_to" "uuid",
    "user_id" "uuid" NOT NULL,
    CONSTRAINT "valid_priority" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['open'::"text", 'in_progress'::"text", 'resolved'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."support_tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "is_staff" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ticket_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_consent_records" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "consent_type" character varying(255) NOT NULL,
    "consent_given" boolean NOT NULL,
    "consent_version" character varying(100) NOT NULL,
    "consent_timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "consent_expiry" timestamp with time zone,
    "consent_method" character varying(100) NOT NULL,
    "ip_address" character varying(45),
    "user_agent" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."user_consent_records" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_debt_summary" WITH ("security_invoker"='on') AS
 SELECT "debts"."user_id",
    "count"(*) AS "debt_count",
    "sum"("debts"."amount") AS "total_debt",
    "sum"("debts"."minimum_payment") AS "total_minimum_payment",
    "max"("debts"."interest_rate") AS "highest_interest_rate"
   FROM "public"."debts"
  GROUP BY "debts"."user_id";


ALTER TABLE "public"."user_debt_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subscription_id" "text" NOT NULL,
    "status" "text" NOT NULL,
    "plan_name" "text" NOT NULL,
    "current_period_end" timestamp with time zone,
    "cancel_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'canceled'::"text", 'past_due'::"text", 'trial'::"text", 'unpaid'::"text"])))
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_subscriptions" IS 'Stores subscription information for users';



COMMENT ON COLUMN "public"."user_subscriptions"."id" IS 'Unique identifier for the subscription record';



COMMENT ON COLUMN "public"."user_subscriptions"."user_id" IS 'User who owns the subscription';



COMMENT ON COLUMN "public"."user_subscriptions"."subscription_id" IS 'ID from the payment provider (e.g., Stripe subscription ID)';



COMMENT ON COLUMN "public"."user_subscriptions"."status" IS 'Current status of the subscription';



COMMENT ON COLUMN "public"."user_subscriptions"."plan_name" IS 'Name of the subscription plan';



COMMENT ON COLUMN "public"."user_subscriptions"."current_period_end" IS 'When the current subscription period ends';



COMMENT ON COLUMN "public"."user_subscriptions"."cancel_at" IS 'When the subscription is scheduled to be canceled';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "password" "text" NOT NULL,
    "subscription_id" "text",
    "subscription_status" "text" DEFAULT 'inactive'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "users_subscription_status_check" CHECK (("subscription_status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'trial'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."migration_log" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."migration_log_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."account_deletion_requests"
    ADD CONSTRAINT "account_deletion_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bank_accounts"
    ADD CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cookie_consent_preferences"
    ADD CONSTRAINT "cookie_consent_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."data_export_requests"
    ADD CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."debts"
    ADD CONSTRAINT "debts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."migration_log"
    ADD CONSTRAINT "migration_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_audit_log"
    ADD CONSTRAINT "security_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_events"
    ADD CONSTRAINT "security_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_comments"
    ADD CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_consent_records"
    ADD CONSTRAINT "user_consent_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "account_statistics_user_id_idx" ON "public"."account_statistics" USING "btree" ("user_id");



CREATE INDEX "bank_accounts_institution_idx" ON "public"."bank_accounts" USING "btree" ("institution");



CREATE INDEX "bank_accounts_user_id_idx" ON "public"."bank_accounts" USING "btree" ("user_id");



CREATE INDEX "chat_messages_session_id_idx" ON "public"."chat_messages" USING "btree" ("session_id");



CREATE INDEX "chat_messages_timestamp_idx" ON "public"."chat_messages" USING "btree" ("timestamp");



CREATE INDEX "chat_messages_user_id_idx" ON "public"."chat_messages" USING "btree" ("user_id");



CREATE INDEX "debts_type_idx" ON "public"."debts" USING "btree" ("type");



CREATE INDEX "debts_user_id_idx" ON "public"."debts" USING "btree" ("user_id");



CREATE INDEX "idx_account_deletion_status" ON "public"."account_deletion_requests" USING "btree" ("status");



CREATE INDEX "idx_account_deletion_user_id" ON "public"."account_deletion_requests" USING "btree" ("user_id");



CREATE INDEX "idx_chat_messages_created_at" ON "public"."chat_messages" USING "btree" ("created_at");



CREATE INDEX "idx_chat_messages_session_id" ON "public"."chat_messages" USING "btree" ("session_id");



CREATE INDEX "idx_chat_messages_user_id" ON "public"."chat_messages" USING "btree" ("user_id");



CREATE INDEX "idx_cookie_consent_user_id" ON "public"."cookie_consent_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_data_export_status" ON "public"."data_export_requests" USING "btree" ("status");



CREATE INDEX "idx_data_export_user_id" ON "public"."data_export_requests" USING "btree" ("user_id");



CREATE INDEX "idx_debts_amount" ON "public"."debts" USING "btree" ("amount");



CREATE INDEX "idx_debts_created_at" ON "public"."debts" USING "btree" ("created_at");



CREATE INDEX "idx_debts_type" ON "public"."debts" USING "btree" ("type");



CREATE INDEX "idx_debts_user_id" ON "public"."debts" USING "btree" ("user_id");



CREATE INDEX "idx_job_applications_applied_at" ON "public"."job_applications" USING "btree" ("applied_at");



CREATE INDEX "idx_job_applications_email" ON "public"."job_applications" USING "btree" ("email");



CREATE INDEX "idx_job_applications_status" ON "public"."job_applications" USING "btree" ("status");



CREATE INDEX "idx_password_reset_tokens_token" ON "public"."password_reset_tokens" USING "btree" ("token");



CREATE INDEX "idx_security_audit_log_created_at" ON "public"."security_audit_log" USING "btree" ("created_at");



CREATE INDEX "idx_security_audit_log_event_type" ON "public"."security_audit_log" USING "btree" ("event_type");



CREATE INDEX "idx_security_audit_log_severity" ON "public"."security_audit_log" USING "btree" ("severity");



CREATE INDEX "idx_security_audit_log_user_id" ON "public"."security_audit_log" USING "btree" ("user_id");



CREATE INDEX "idx_security_events_user_id" ON "public"."security_events" USING "btree" ("user_id");



CREATE INDEX "idx_subscriptions_status" ON "public"."subscriptions" USING "btree" ("status");



CREATE INDEX "idx_subscriptions_stripe_customer_id" ON "public"."subscriptions" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_subscriptions_stripe_subscription_id" ON "public"."subscriptions" USING "btree" ("stripe_subscription_id");



CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_support_tickets_created_at" ON "public"."support_tickets" USING "btree" ("created_at");



CREATE INDEX "idx_support_tickets_email" ON "public"."support_tickets" USING "btree" ("email");



CREATE INDEX "idx_support_tickets_status" ON "public"."support_tickets" USING "btree" ("status");



CREATE INDEX "idx_support_tickets_user_id" ON "public"."support_tickets" USING "btree" ("user_id");



CREATE INDEX "idx_ticket_comments_created_at" ON "public"."ticket_comments" USING "btree" ("created_at");



CREATE INDEX "idx_ticket_comments_ticket_id" ON "public"."ticket_comments" USING "btree" ("ticket_id");



CREATE INDEX "idx_user_consent_records_type" ON "public"."user_consent_records" USING "btree" ("consent_type");



CREATE INDEX "idx_user_consent_records_user_id" ON "public"."user_consent_records" USING "btree" ("user_id");



CREATE INDEX "job_applications_email_idx" ON "public"."job_applications" USING "btree" ("email");



CREATE INDEX "job_applications_position_idx" ON "public"."job_applications" USING "btree" ("position");



CREATE INDEX "job_applications_status_idx" ON "public"."job_applications" USING "btree" ("status");



CREATE INDEX "transactions_account_date_idx" ON "public"."transactions" USING "btree" ("account_id", "transaction_date" DESC);



CREATE INDEX "transactions_date_type_idx" ON "public"."transactions" USING "btree" ("transaction_date", "transaction_type");



CREATE INDEX "user_subscriptions_status_idx" ON "public"."user_subscriptions" USING "btree" ("status");



CREATE INDEX "user_subscriptions_user_id_idx" ON "public"."user_subscriptions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_bank_accounts_timestamp" BEFORE UPDATE ON "public"."bank_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_debts_updated_at" BEFORE UPDATE ON "public"."debts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_job_applications_updated_at" BEFORE UPDATE ON "public"."job_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_support_tickets_updated_at" BEFORE UPDATE ON "public"."support_tickets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."account_deletion_requests"
    ADD CONSTRAINT "account_deletion_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bank_accounts"
    ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cookie_consent_preferences"
    ADD CONSTRAINT "cookie_consent_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."data_export_requests"
    ADD CONSTRAINT "data_export_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."debts"
    ADD CONSTRAINT "debts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."security_events"
    ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ticket_comments"
    ADD CONSTRAINT "ticket_comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_consent_records"
    ADD CONSTRAINT "user_consent_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow authenticated users to delete security events" ON "public"."security_events" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read security events" ON "public"."security_events" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update security events" ON "public"."security_events" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow inserting security events" ON "public"."security_events" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anyone can create a support ticket" ON "public"."support_tickets" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can submit an application" ON "public"."job_applications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can submit job applications" ON "public"."job_applications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Hiring managers can update applications" ON "public"."job_applications" FOR UPDATE USING ((("auth"."jwt"() ->> 'role'::"text") = 'hiring_manager'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'hiring_manager'::"text"));



CREATE POLICY "Hiring managers can view all applications" ON "public"."job_applications" FOR SELECT USING ((("auth"."jwt"() ->> 'role'::"text") = 'hiring_manager'::"text"));



CREATE POLICY "Hiring team can update applications" ON "public"."job_applications" FOR UPDATE USING ((("auth"."jwt"() ->> 'role'::"text") = 'hiring'::"text"));



CREATE POLICY "Hiring team can view applications" ON "public"."job_applications" FOR SELECT USING ((("auth"."jwt"() ->> 'role'::"text") = 'hiring'::"text"));



CREATE POLICY "Profiles can be created for new users" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Service role can manage all subscriptions" ON "public"."user_subscriptions" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage subscriptions" ON "public"."subscriptions" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Support staff can update tickets" ON "public"."support_tickets" FOR UPDATE USING ((("auth"."jwt"() ->> 'role'::"text") = 'support'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'support'::"text"));



CREATE POLICY "Support staff can view all tickets" ON "public"."support_tickets" FOR SELECT USING ((("auth"."jwt"() ->> 'role'::"text") = 'support'::"text"));



CREATE POLICY "Users can delete their own debts" ON "public"."debts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own ticket comments" ON "public"."ticket_comments" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert only their own messages" ON "public"."chat_messages" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own debts" ON "public"."debts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own ticket comments" ON "public"."ticket_comments" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can read only their own messages" ON "public"."chat_messages" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read only their own subscriptions" ON "public"."user_subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own data" ON "public"."users" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update their own debts" ON "public"."debts" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own ticket comments" ON "public"."ticket_comments" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own applications" ON "public"."job_applications" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = "email"));



CREATE POLICY "Users can view their own data" ON "public"."users" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can view their own debts" ON "public"."debts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own reset tokens" ON "public"."password_reset_tokens" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own subscriptions" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own support tickets" ON "public"."support_tickets" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = "email"));



CREATE POLICY "Users can view their own ticket comments" ON "public"."ticket_comments" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."account_deletion_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_view_all_consent_records" ON "public"."user_consent_records" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."role")::"text" = 'admin'::"text")))));



ALTER TABLE "public"."bank_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cookie_consent_preferences" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "create_own_consent_records" ON "public"."user_consent_records" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "create_own_deletion_requests" ON "public"."account_deletion_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "create_own_export_requests" ON "public"."data_export_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."data_export_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."debts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_own_accounts" ON "public"."bank_accounts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "delete_own_debts" ON "public"."debts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "insert_own_accounts" ON "public"."bank_accounts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "insert_own_cookie_preferences" ON "public"."cookie_consent_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "insert_own_debts" ON "public"."debts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."job_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."migration_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."password_reset_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."security_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."security_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_active_subscriptions" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "select_own_accounts" ON "public"."bank_accounts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "select_own_debts" ON "public"."debts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "select_policy" ON "public"."migration_log" FOR SELECT USING (true);



CREATE POLICY "select_policy" ON "public"."security_audit_log" FOR SELECT USING (true);



CREATE POLICY "select_profiles" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ticket_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "transactions_delete_policy" ON "public"."transactions" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."bank_accounts"
  WHERE (("bank_accounts"."id" = "transactions"."account_id") AND ("bank_accounts"."user_id" = "auth"."uid"())))));



CREATE POLICY "transactions_insert_policy" ON "public"."transactions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."bank_accounts"
  WHERE (("bank_accounts"."id" = "transactions"."account_id") AND ("bank_accounts"."user_id" = "auth"."uid"())))));



CREATE POLICY "transactions_select_policy" ON "public"."transactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."bank_accounts"
  WHERE (("bank_accounts"."id" = "transactions"."account_id") AND ("bank_accounts"."user_id" = "auth"."uid"())))));



CREATE POLICY "transactions_update_policy" ON "public"."transactions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."bank_accounts"
  WHERE (("bank_accounts"."id" = "transactions"."account_id") AND ("bank_accounts"."user_id" = "auth"."uid"())))));



CREATE POLICY "update_own_accounts" ON "public"."bank_accounts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "update_own_cookie_preferences" ON "public"."cookie_consent_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "update_own_debts" ON "public"."debts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_consent_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "view_own_consent_records" ON "public"."user_consent_records" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "view_own_cookie_preferences" ON "public"."cookie_consent_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "view_own_deletion_requests" ON "public"."account_deletion_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "view_own_export_requests" ON "public"."data_export_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_chat_sessions"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_chat_sessions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_chat_sessions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_email_confirmation_procedure"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_email_confirmation_procedure"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_email_confirmation_procedure"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."execute_sql"("sql" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."execute_sql"("sql" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."execute_sql"("sql" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."execute_sql"("sql" "text") TO "anon";



GRANT ALL ON FUNCTION "public"."get_table_statistics"("table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_statistics"("table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_statistics"("table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_update_v2"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_update_v2"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_update_v2"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_security_event"("p_user_id" "uuid", "p_event_type" "text", "p_ip_address" "text", "p_user_agent" "text", "p_email" "text", "p_details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_security_event"("p_user_id" "uuid", "p_event_type" "text", "p_ip_address" "text", "p_user_agent" "text", "p_email" "text", "p_details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_security_event"("p_user_id" "uuid", "p_event_type" "text", "p_ip_address" "text", "p_user_agent" "text", "p_email" "text", "p_details" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."pg_get_coldef"() TO "anon";
GRANT ALL ON FUNCTION "public"."pg_get_coldef"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."pg_get_coldef"() TO "service_role";



GRANT ALL ON FUNCTION "public"."record_user_consent"() TO "anon";
GRANT ALL ON FUNCTION "public"."record_user_consent"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_user_consent"() TO "service_role";



GRANT ALL ON FUNCTION "public"."record_user_consent"("p_user_id" "uuid", "p_consent_type" character varying, "p_consent_given" boolean, "p_consent_version" character varying, "p_consent_method" character varying, "p_ip_address" character varying, "p_user_agent" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."record_user_consent"("p_user_id" "uuid", "p_consent_type" character varying, "p_consent_given" boolean, "p_consent_version" character varying, "p_consent_method" character varying, "p_ip_address" character varying, "p_user_agent" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_user_consent"("p_user_id" "uuid", "p_consent_type" character varying, "p_consent_given" boolean, "p_consent_version" character varying, "p_consent_method" character varying, "p_ip_address" character varying, "p_user_agent" "text", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_account_statistics"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_account_statistics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_account_statistics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."security_execute_sql"("sql" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."security_execute_sql"("sql" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."security_execute_sql"("sql" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."account_deletion_requests" TO "anon";
GRANT ALL ON TABLE "public"."account_deletion_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."account_deletion_requests" TO "service_role";



GRANT ALL ON TABLE "public"."bank_accounts" TO "anon";
GRANT ALL ON TABLE "public"."bank_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."account_statistics" TO "anon";
GRANT ALL ON TABLE "public"."account_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."account_statistics" TO "service_role";



GRANT ALL ON TABLE "public"."password_reset_tokens" TO "anon";
GRANT ALL ON TABLE "public"."password_reset_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."password_reset_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."active_password_reset_tokens" TO "anon";
GRANT ALL ON TABLE "public"."active_password_reset_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."active_password_reset_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."active_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."active_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."active_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."cookie_consent_preferences" TO "anon";
GRANT ALL ON TABLE "public"."cookie_consent_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."cookie_consent_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."data_export_requests" TO "anon";
GRANT ALL ON TABLE "public"."data_export_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."data_export_requests" TO "service_role";



GRANT ALL ON TABLE "public"."debts" TO "anon";
GRANT ALL ON TABLE "public"."debts" TO "authenticated";
GRANT ALL ON TABLE "public"."debts" TO "service_role";



GRANT ALL ON TABLE "public"."job_applications" TO "anon";
GRANT ALL ON TABLE "public"."job_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."job_applications" TO "service_role";



GRANT ALL ON TABLE "public"."migration_log" TO "anon";
GRANT ALL ON TABLE "public"."migration_log" TO "authenticated";
GRANT ALL ON TABLE "public"."migration_log" TO "service_role";



GRANT ALL ON SEQUENCE "public"."migration_log_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."migration_log_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."migration_log_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."security_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."security_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."security_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."security_events" TO "anon";
GRANT ALL ON TABLE "public"."security_events" TO "authenticated";
GRANT ALL ON TABLE "public"."security_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."security_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."security_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."security_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."support_tickets" TO "anon";
GRANT ALL ON TABLE "public"."support_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."support_tickets" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_comments" TO "anon";
GRANT ALL ON TABLE "public"."ticket_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_comments" TO "service_role";



GRANT ALL ON TABLE "public"."user_consent_records" TO "anon";
GRANT ALL ON TABLE "public"."user_consent_records" TO "authenticated";
GRANT ALL ON TABLE "public"."user_consent_records" TO "service_role";



GRANT ALL ON TABLE "public"."user_debt_summary" TO "anon";
GRANT ALL ON TABLE "public"."user_debt_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."user_debt_summary" TO "service_role";



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
