// Script to check profiles table structure
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfilesStructure() {
  try {
    console.log("Checking profiles table structure...");

    // Get table structure using system metadata
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", "profiles")
      .eq("table_schema", "public");

    if (columnsError) {
      console.error("Error fetching columns:", columnsError);
      return;
    }

    console.log("Profiles table structure:");
    console.table(columns);

    // Check the trigger definition
    const { data: triggers, error: triggersError } = await supabase.rpc(
      "security_execute_sql",
      {
        sql: `
          SELECT 
            trigger_name, 
            event_manipulation, 
            action_statement 
          FROM 
            information_schema.triggers 
          WHERE 
            event_object_table = 'users' 
            AND event_object_schema = 'auth'
        `,
      }
    );

    if (triggersError) {
      console.error("Error fetching triggers:", triggersError);
      // Try alternative approach if RPC fails
      const { data: altTriggers, error: altTriggersError } = await supabase
        .from("pg_trigger")
        .select("*")
        .contains("tgname", "user");

      if (!altTriggersError && altTriggers) {
        console.log("Triggers found via alternative method:");
        console.table(altTriggers);
      } else {
        console.error(
          "Alternative trigger query also failed:",
          altTriggersError
        );
      }
    } else {
      console.log("Triggers:");
      console.table(triggers);
    }

    // Check handle_new_user function definition
    const { data: functionDef, error: functionError } = await supabase.rpc(
      "security_execute_sql",
      {
        sql: `
          SELECT 
            routine_name,
            routine_definition
          FROM 
            information_schema.routines
          WHERE 
            routine_name = 'handle_new_user'
            AND routine_schema = 'public'
        `,
      }
    );

    if (functionError) {
      console.error("Error fetching function definition:", functionError);
    } else {
      console.log("handle_new_user function definition:");
      console.log(functionDef);
    }
  } catch (error) {
    console.error("Error checking profiles structure:", error);
  }
}

checkProfilesStructure();
