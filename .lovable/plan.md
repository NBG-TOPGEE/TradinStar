

## Problem

The app shows a blank white screen. The `src/integrations/supabase/client.ts` file was manually modified with validation logic that `throw`s an error when environment variables are missing. This crashes the entire app. This file is auto-generated and must not be edited.

## Fix

**Restore `client.ts` to the standard auto-generated format:**

Replace the entire file with the standard Lovable Cloud client:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lftcimkllwotimqhsooh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdGNpbWtsbHdvdGltcWhzb29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTk0OTEsImV4cCI6MjA4ODM3NTQ5MX0.U5hpQtCX_xrL_2xyif6TDu_6gRACgx7sxAE5nS-qOB0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

This removes the `throw` that kills the app and hardcodes the credentials (which is the standard pattern for Lovable Cloud projects). The env var approach fails in the deployed preview because the vars aren't injected at runtime.

