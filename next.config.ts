import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the setup route reads the schema file at runtime
  outputFileTracingIncludes: { "/api/admin/setup": ["./supabase/schema.sql"] },
};

export default nextConfig;
