 /* eslint-disable */

 <script>
    const SUPABASE_URL = "https://utrmpajuymlcqixcdter.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cm1wYWp1eW1sY3FpeGNkdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjExMTMsImV4cCI6MjA3NzgzNzExM30.6gEBRDGSsS7pE_I73C2ioGLyCo62Wyv6XtGPKzM4AHg";

    if (typeof window.supabase === 'undefined') {
      console.error('Supabase script not loaded.');
    } else {
      const { createClient } = window.supabase;
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const $ = id => document.getElementById(id);

      const emailInput = $('email'), passInput = $('password');
      const signupBtn = $('signupBtn'), loginBtn = $('loginBtn'), logoutBtn = $('logoutBtn');
      const authMsg = $('authMsg');
      const authDiv = $('auth'), appDiv = $('app'), previousPlansPage = $('previousPlansPage');
      const planStatus = $('planStatus'), planJson = $('planJson');
      const messagesDiv = $('messages'), msgInput = $('msgInput'), sendMsgBtn = $('sendMsgBtn');
      const previousPlansBtn = $('previousPlansBtn'), previousPlansContent = $('previousPlansContent'), backToAppBtn = $('backToAppBtn');
      const generateTodayBtn = $('generateTodayBtn');

      // Helper function to safely get user and handle auth errors
      async function getCurrentUser() {
        try {
          const { data: { user }, error } = await supabaseClient.auth.getUser();
          if (error || !user) {
            console.warn('User not authenticated or session expired:', error?.message);
            showAuth();
            return null;
          }
          return user;
        } catch (err) {
          console.error('Error getting user:', err);
          showAuth();
          return null;
        }
      }

      signupBtn.onclick = async () => {
        authMsg.textContent = "";
        const email = emailInput.value.trim(), password = passInput.value.trim();
        if (!email || !password) { authMsg.textContent = "Provide email & password"; return; }
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) authMsg.textContent = error.message; else authMsg.textContent = "Check your email to confirm (if enabled)";
      };

      loginBtn.onclick = async () => {
        authMsg.textContent = "";
        const email = emailInput.value.trim(), password = passInput.value.trim();
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) { authMsg.textContent = error.message; return; }
        initApp();
      };

      logoutBtn.onclick = async () => {
        await supabaseClient.auth.signOut();
        showAuth();
      };

      function showAuth() { authDiv.classList.remove('hidden'); appDiv.classList.add('hidden'); previousPlansPage.classList.add('hidden'); }
      function showApp() { authDiv.classList.add('hidden'); appDiv.classList.remove('hidden'); previousPlansPage.classList.add('hidden'); }
      function showPreviousPlans() { authDiv.classList.add('hidden'); appDiv.classList.add('hidden'); previousPlansPage.classList.remove('hidden'); }

      async function initApp() {
        const user = await getCurrentUser();
        if (!user) return;
        showApp();
        await loadPlanForUser(user.id);
        await loadMessages(user.id);
        supabaseClient.channel('public:messages')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            const m = payload.new;
            if (m.user_id === user.id) addMessageToUI(m);
          })
          .subscribe();
      }

      async function loadPlanForUser(userId) {
        const today = new Date().toISOString().slice(0, 10);
        planStatus.textContent = "Fetching plan…";
        const { data, error } = await supabaseClient
          .from('plans')
          .select('id, plan_date, plan_json, created_at')
          .eq('user_id', userId)
          .eq('plan_date', today)
          .limit(1)
          .order('created_at', { ascending: false });
        if (error) {
          planStatus.textContent = "Error loading plan: " + error.message;
          planJson.textContent = "";
          return;
        }
        if (!data || data.length === 0) {
          planStatus.textContent = "No plan for today. Generate one below!";
          planJson.textContent = "";
          return;
        }
        planStatus.textContent = "Today's plan:";
        const formattedPlan = data[0].plan_json.replace(/\\n/g, '\n');
        planJson.textContent = formattedPlan;
      }

      async function loadMessages(userId) {
        messagesDiv.innerHTML = "<p class='text-sm text-gray-500'>Loading messages…</p>";
        const { data, error } = await supabaseClient
          .from('messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });
        if (error) { messagesDiv.innerHTML = "<p class='text-sm text-red-500'>Error loading messages</p>"; return; }
        messagesDiv.innerHTML = '';
        data.forEach(addMessageToUI);
      }

      function addMessageToUI(m) {
        const el = document.createElement('div');
        el.className = 'p-2 border-b text-sm';
        el.textContent = (new Date(m.created_at)).toLocaleString() + " — " + m.content;
        messagesDiv.appendChild(el);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }

      sendMsgBtn.onclick = async () => {
        const user = await getCurrentUser();
        if (!user) return;
        const content = msgInput.value.trim();
        if (!content) return;
        const { error } = await supabaseClient.from('messages').insert([{ user_id: user.id, content }]);
        if (error) return alert('Error: ' + error.message);
        msgInput.value = '';
      };

      async function generatePlan() {
        console.log('generatePlan function called');
        try {
          const user = await getCurrentUser();
          if (!user) return;
          console.log('User found:', user.email);

          const { data: profile, error } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          if (error || !profile) {
            alert('User profile not found. Please complete your profile.');
            return;
          }
          console.log('Profile loaded:', profile.email);

          const userData = {
            email: profile.email,
            gender: profile.gender,
            weight: profile.weight,
            date_of_birth: profile.date_of_birth,
            fit_status: profile.fit_status,
            goal: profile.goal,
            days_per_week: profile.days_per_week,
            equipment: profile.equipment,
            isFirstWeek: true,
            feedbackSummary: '',
            user_id: user.id
          };
          console.log('User data prepared:', userData);

          const response = await fetch('/api/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          console.log('Fetch response status:', response.status);

          if (!response.ok) {
            throw new Error('Failed to generate plan options: ' + response.statusText);
          }

          const result = await response.json();
          console.log('Result from n8n:', result);
          
          displayPlanOptions(result);
        } catch (err) {
          console.error('Error generating plan options:', err);
          alert('Error: ' + err.message);
        }
      }

      function displayPlanOptions(plans) {
        const optionsDiv = document.getElementById('planOptions');
        if (!optionsDiv) return;
        optionsDiv.innerHTML = '';
        ['planA', 'planB', 'planC'].forEach(planKey => {
          const plan = plans[planKey];
          if (plan && plan.summary) {
            const planDiv = document.createElement('div');
            planDiv.style.marginBottom = '15px';
            planDiv.style.padding = '10px';
            planDiv.style.border = '1px solid #ccc';
            planDiv.style.backgroundColor = '#fff';
            planDiv.innerHTML = `
              <h4>${planKey.toUpperCase()}</h4>
              <p><strong>Summary:</strong> ${plan.summary}</p>
              <p><strong>Details:</strong> ${plan.details ? plan.details.replace(/\n/g, '<br>') : 'No details'}</p>
              <p><strong>Notes:</strong> ${plan.notes || 'No notes'}</p>
              <button class="chooseBtn" data-plan="${planKey}" style="background-color: #007BFF; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">Choose This Plan</button>
            `;
            optionsDiv.appendChild(planDiv);
          }
        });
        document.getElementById('planSelection').classList.remove('hidden');
      }

      async function choosePlan(planKey) {
        try {
          const user = await getCurrentUser();
          if (!user) return;
          const userData = { chosenPlan: planKey, userId: user.id, email: user.email };
          const response = await fetch('/api/choose-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          if (!response.ok) {
            throw new Error('Failed to finalize plan: ' + response.statusText);
          }
          const result = await response.json();
          alert('Plan chosen! You can now generate today\'s plan.');
          document.getElementById('planSelection').classList.add('hidden');
          await loadPlanForUser(user.id);
        } catch (err) {
          console.error('Error choosing plan:', err);
          alert('Error: ' + err.message);
        }
      }

     async function generateTodayPlan() {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const { data: existingPlan, error } = await supabaseClient
      .from('plans')
      .select('chosen_plan')
      .eq('user_id', user.id)
      .limit(1)
      .order('created_at', { ascending: false });
    if (error || !existingPlan || existingPlan.length === 0 || !existingPlan[0].chosen_plan) {
      alert('No chosen plan found. Choose a weekly plan first.');
      return;
    }
    const chosenPlan = existingPlan[0].chosen_plan;

    const response = await fetch('/api/generate-today-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    if (!response.ok) {
      const errorText = await response.text();  // Get the actual error response
      throw new Error(`API failed: ${response.status} - ${errorText}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Response is not JSON: ${text}`);
    }
    const data = await response.json();  // Only parse if it's JSON
    console.log('Plan generated:', data);
    alert('Today’s plan generated successfully!');
    await loadPlanForUser(user.id);
  } catch (err) {
    console.error('Error generating today\'s plan:', err);
    alert('Error: ' + err.message);
  }
}

      async function loadPreviousPlans() {
        try {
          const user = await getCurrentUser();
          if (!user) return;
          const { data, error } = await supabaseClient
            .from('plans')
            .select('chosen_plan, current_day, plan_date, plan_json')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (error) {
            previousPlansContent.innerHTML = 'Error loading history.';
            return;
          }
          previousPlansContent.innerHTML = data.length === 0 ? '<p>No previous plans found.</p>' :
            data.map(p => `
              <div class="mb-4 p-4 border rounded bg-white">
                <h4 class="font-semibold">Plan for ${p.plan_date} (Day ${p.current_day})</h4>
                <p><strong>Chosen Plan:</strong> ${p.chosen_plan || 'None'}</p>
                <pre class="text-xs mt-2 overflow-auto">${p.plan_json ? p.plan_json.replace(/\\n/g, '\n') : 'No details'}</pre>
              </div>
            `).join('');
        } catch (err) {
          console.error('Error loading previous plans:', err);
        }
      }

      document.getElementById('generatePlanBtn').addEventListener('click', generatePlan);
      document.getElementById('generateTodayBtn').addEventListener('click', generateTodayPlan);
      document.getElementById('previousPlansBtn').addEventListener('click', () => {
        loadPreviousPlans();
        showPreviousPlans();
      });
      document.getElementById('backToAppBtn').addEventListener('click', showApp);
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('chooseBtn')) {
          const planKey = e.target.getAttribute('data-plan');
          choosePlan(planKey);
        }
      });

      (async () => {
        const user = await getCurrentUser();
        if (user) initApp(); else showAuth();
      })();
    }
  </script>