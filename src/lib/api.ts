// One place that talks to the backend. Every page uses these functions.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type TestCenter = { _id: string; name: string; code?: string };

export type User = {
  _id: string;
  name: string;
  email: string;
  role: "instructor" | "admin";
  adiBadgeNumber?: string;
  testCenters: TestCenter[];
  profileComplete: boolean;
};

export type Test = {
  _id: string;
  reference: string;
  pupilName: string;
  testDate: string;
  testCenter: { centerId: string; name: string; code?: string };
  result: "pass" | "fail";
  faults: { driving: number; serious: number; dangerous: number };
  totalFaults: number;
  physicalIntervention: boolean;
  verbalIntervention: boolean;
  createdAt: string;
};

export type Metrics = {
  drivingFaultAverage: number;
  seriousFaultAverage: number;
  physicalInterventionRate: number;
  passRate: number;
};

export type Performance = {
  windowMonths: number;
  total: number;
  passed: number;
  minTests: number;
  // False when there are too few tests to show the instructor a colour.
  hasEnoughData: boolean;
  metrics: Metrics;
  thresholds: Metrics;
  triggers: (keyof Metrics)[];
  score: number;
  band: "green" | "amber" | "red";
};

// What the log-a-test wizard sends.
export type NewTest = {
  pupilName: string;
  testDate: string;
  centerId: string;
  result: "pass" | "fail";
  faults: { driving: number; serious: number; dangerous: number };
  physicalIntervention: boolean;
  verbalIntervention: boolean;
};

export type TrendMonth = {
  month: string;
  label: string;
  total: number;
  passed: number;
  failed: number;
  // null when no tests were logged that month, so the line shows a gap
  passRate: number | null;
  driving: number;
  serious: number;
  dangerous: number;
};

export type Trend = {
  range: TrendRange;
  months: TrendMonth[];
  totals: {
    tests: number;
    passed: number;
    failed: number;
    driving: number;
    serious: number;
    dangerous: number;
  };
};

export type TrendRange = "6" | "12" | "all";

// Everything the test list can be narrowed by. All optional, all combine.
export type TestQuery = {
  page?: number;
  limit?: number;
  search?: string;
  from?: string;
  to?: string;
  physicalIntervention?: "" | "true" | "false";
  verbalIntervention?: "" | "true" | "false";
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type Billing = {
  // false = billing is switched off on the server; nothing is paywalled.
  enabled: boolean;
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "none";
  plan: string;
  trialEndsAt?: string;
  trialDaysLeft: number;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  // True while the account may use the paid features.
  hasAccess: boolean;
  hasBillingAccount: boolean;
  testMode: boolean;
  configured: boolean;
};

// --- PDF standards report ---
export type ReportWorking = {
  key: string;
  label: string;
  meaning: string;
  formula: string;
  value: number;
  unit: string;
  decimals: number;
  threshold: number;
  triggerRule: string;
  triggered: boolean;
};

export type ReportScoreRow = {
  key: string;
  label: string;
  value: number;
  unit: string;
  threshold: number;
  triggered: boolean;
  severity: number;
  points: number;
  maxPoints: number;
  working: string;
};

export type ReportTest = {
  reference: string;
  date: string;
  // null when the instructor chose to withhold names
  pupilName: string | null;
  testCenter: string;
  result: "pass" | "fail";
  driving: number;
  serious: number;
  dangerous: number;
  physicalIntervention: boolean;
  verbalIntervention: boolean;
};

export type Report = {
  generatedAt: string;
  period: { from: string; to: string; label: string };
  instructor: { name: string; adiBadgeNumber: string; testCenters: string[] };
  namesHidden: boolean;
  totals: {
    tests: number;
    passed: number;
    failed: number;
    driving: number;
    serious: number;
    dangerous: number;
    interventions: number;
    verbalInstructions: number;
  };
  metrics: Metrics;
  triggers: string[];
  workings: ReportWorking[];
  score: { total: number; rows: ReportScoreRow[]; pointsPerMetric: number };
  band: "green" | "amber" | "red";
  hasEnoughData: boolean;
  rules: {
    windowMonths: number;
    minTests: number;
    passRateTarget: number;
    pointsPerMetric: number;
    redTriggers: number;
    amberTriggers: number;
    thresholds: Metrics;
    metrics: { key: string; label: string; unit: string; threshold: number; rule: string }[];
  };
  windowNote: string;
  tests: ReportTest[];
};

type AuthResult = { user: User; token: string };

type Options = { method?: string; body?: unknown; token?: string };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  let res: Response;

  try {
    res = await fetch(BASE_URL + path, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    // fetch only throws like this when the server cannot be reached at all.
    throw new Error("Cannot reach the server. Is the API running?");
  }

  const json = await res.json().catch(() => ({}));

  // The API always answers { success, message?, data? }.
  if (!res.ok) throw new Error(json.message || "Something went wrong");

  return json.data as T;
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResult>("/auth/register", { method: "POST", body: { name, email, password } }),

  login: (email: string, password: string) =>
    request<AuthResult>("/auth/login", { method: "POST", body: { email, password } }),

  me: (token: string) => request<{ user: User }>("/auth/me", { token }),

  // --- profile ---
  updateProfile: (token: string, body: { name?: string; adiBadgeNumber?: string }) =>
    request<{ user: User }>("/users/me", { method: "PATCH", body, token }),

  addTestCenter: (token: string, body: { name: string; code?: string }) =>
    request<{ user: User }>("/users/me/test-centers", { method: "POST", body, token }),

  updateTestCenter: (token: string, centerId: string, body: { name?: string; code?: string }) =>
    request<{ user: User }>(`/users/me/test-centers/${centerId}`, {
      method: "PATCH",
      body,
      token,
    }),

  removeTestCenter: (token: string, centerId: string) =>
    request<{ user: User }>(`/users/me/test-centers/${centerId}`, {
      method: "DELETE",
      token,
    }),

  // --- billing ---
  // sync=1 reads the live state from Stripe, for when webhooks are not
  // being forwarded in development.
  getBilling: (token: string, sync = false) =>
    request<{ billing: Billing }>(`/billing${sync ? "?sync=1" : ""}`, { token }),

  startCheckout: (token: string, successUrl: string, cancelUrl: string) =>
    request<{ url: string }>("/billing/checkout", {
      method: "POST",
      body: { successUrl, cancelUrl },
      token,
    }),

  openBillingPortal: (token: string, returnUrl: string) =>
    request<{ url: string }>("/billing/portal", {
      method: "POST",
      body: { returnUrl },
      token,
    }),

  // --- tests ---
  createTest: (token: string, body: NewTest) =>
    request<{ test: Test }>("/tests", { method: "POST", body, token }),

  // affectsRating says whether the edit moved the performance figures.
  // Editing only a pupil name, date or centre comes back false.
  updateTest: (token: string, testId: string, body: NewTest) =>
    request<{ test: Test; affectsRating: boolean }>(`/tests/${testId}`, {
      method: "PATCH",
      body,
      token,
    }),

  listTests: (token: string, query: TestQuery = {}) => {
    // Empty values are left out entirely, so "any" really means no filter.
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    }

    return request<{ tests: Test[]; pagination: Pagination }>(
      `/tests?${params.toString()}`,
      { token }
    );
  },

  getReport: (token: string, from: string, to: string, hideNames: boolean) =>
    request<{ report: Report }>(
      `/tests/report?from=${from}&to=${to}${hideNames ? "&hideNames=1" : ""}`,
      { token }
    ),

  getTrend: (token: string, range: TrendRange) =>
    request<{ trend: Trend }>(`/tests/trend?range=${range}`, { token }),

  getPerformance: (token: string) =>
    request<{ performance: Performance }>("/tests/performance", { token }),

  deleteTest: (token: string, testId: string) =>
    request<{ success: boolean }>(`/tests/${testId}`, { method: "DELETE", token }),
};
