'use client';

import Script from "next/script";

export default function Page() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Gym Plan App (MVP)</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </head>
      <body className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white shadow rounded-lg p-6">
          {/* --- Auth Section --- */}
          <div id="auth" className="space-y-4">
            <h1 className="text-2xl font-bold">Gym Plan App — MVP</h1>
            <div id="auth-forms">
              <input id="email" type="email" placeholder="Email" className="w-full p-2 border rounded" />
              <input id="password" type="password" placeholder="Password" className="w-full p-2 border rounded" />
              <div className="flex gap-2">
                <button id="signupBtn" className="bg-blue-600 text-white px-4 py-2 rounded">Sign up</button>
                <button id="loginBtn" className="bg-green-600 text-white px-4 py-2 rounded">Log in</button>
              </div>
              <p id="authMsg" className="text-sm text-red-500"></p>
            </div>
          </div>

          {/* --- Main App Section --- */}
          <div id="app" className="hidden space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your plan</h2>
              <div>
                <button id="logoutBtn" className="text-sm text-gray-600">Log out</button>
                <button id="previousPlansBtn" className="text-sm text-blue-600 ml-2">Previous Chosen Plans</button>
              </div>
            </div>

            <div id="planCard" className="p-4 border rounded bg-gray-50">
              <p id="planStatus" className="text-sm text-gray-600">Loading plan…</p>
              <pre id="planJson" className="text-xs mt-2 overflow-auto"></pre>
            </div>

            <div id="planSelection" className="hidden p-4 border rounded bg-gray-50">
              <h3 className="font-medium">Choose Your Plan</h3>
              <div id="planOptions" className="mt-4 space-y-4"></div>
            </div>

            <div>
              <h3 className="font-medium">Chat / Feedback</h3>
              <div id="messages" className="h-40 overflow-auto border rounded p-2 bg-white mb-2"></div>
              <div className="flex gap-2">
                <input id="msgInput" className="flex-1 p-2 border rounded" placeholder="Type a message..." />
                <button id="sendMsgBtn" className="bg-indigo-600 text-white px-4 py-2 rounded">Send</button>
              </div>
            </div>

            <div className="flex gap-2">
              <button id="generatePlanBtn" className="bg-green-600 text-white px-4 py-2 rounded flex-1">
                Generate New Weekly Plan
              </button>
              <button id="generateTodayBtn" className="bg-blue-600 text-white px-4 py-2 rounded flex-1">
                Generate Today's Plan
              </button>
            </div>
            <div id="planDisplay" className="mt-4 p-4 border rounded bg-gray-50 whitespace-pre-wrap"></div>
          </div>

          {/* --- Previous Plans Page --- */}
          <div id="previousPlansPage" className="hidden space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Previous Chosen Plans</h2>
              <button id="backToAppBtn" className="text-sm text-blue-600">Back to Main App</button>
            </div>
            <div id="previousPlansContent" className="p-4 border rounded bg-gray-50">
              <p className="text-sm text-gray-600">Loading previous plans...</p>
            </div>
          </div>
        </div>

        {/* --- External Scripts --- */}
        <Script src="https://unpkg.com/@supabase/supabase-js@2.39.3/dist/umd/supabase.js" strategy="afterInteractive" />
        <Script id="app-logic" strategy="afterInteractive">
          {`
          <Script src="/app.js" strategy="afterInteractive" />

          `}
        </Script>
      </body>
    </html>
  );
}
