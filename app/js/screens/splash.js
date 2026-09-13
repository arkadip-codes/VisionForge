// Splash & Role Selection Screen

export function renderSplashScreen(container, state) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; padding: 20px;">
      <!-- Logo Emblem -->
      <div style="width: 76px; height: 76px; border-radius: 50%; background: linear-gradient(135deg, #1b3a5b, #0284c7); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 8px 24px rgba(2, 132, 199, 0.35);">
        <span style="font-size: 34px;">⛑️</span>
      </div>

      <span style="background: rgba(56, 189, 248, 0.15); color: #0284c7; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: var(--radius-full); margin-bottom: 8px;">
        TEAM VISIONFORGE
      </span>

      <h1 style="font-size: 26px; font-weight: 900; color: var(--text-primary); margin-bottom: 6px;">
        MINE AR
      </h1>
      <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 320px; line-height: 1.5; margin-bottom: 30px;">
        AR Based Vocational Training Simulator for Industrial Safety in Jharkhand's Underground Coal Mines
      </p>

      <!-- Role Selection Cards -->
      <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 360px; margin-bottom: 24px;">
        <!-- Worker Launch -->
        <button class="training-card" id="btn-role-worker" style="text-align: left; padding: 16px; width: 100%; border: 1.5px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="/assets/images/worker_avatar.svg" alt="Suresh" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #0284c7;" />
            <div style="flex: 1;">
              <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Enter as Worker (Suresh)</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Interactive Lessons, Games & AR Simulator</div>
            </div>
            <span style="font-size: 18px; color: #0284c7;">➔</span>
          </div>
        </button>

        <!-- Supervisor Launch -->
        <button class="training-card" id="btn-role-supervisor" style="text-align: left; padding: 16px; width: 100%; border: 1.5px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #e0f2fe; display: flex; align-items: center; justify-content: center; font-size: 22px;">
              👨‍💼
            </div>
            <div style="flex: 1;">
              <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">Supervisor Console</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Workforce Telemetry, Retraining & DGMS Audit</div>
            </div>
            <span style="font-size: 18px; color: #0284c7;">➔</span>
          </div>
        </button>

        <!-- 1-Click SIH Judge Demo -->
        <button id="btn-role-demo" class="btn-primary" style="background: linear-gradient(135deg, #d97706, #f59e0b); color: #0b1f33; font-weight: 800; padding: 14px; font-size: 14px; border-radius: var(--radius-lg); box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
          ⚡ SIH Judge 2-Minute Demo Mode
        </button>
      </div>

      <div style="font-size: 11px; color: #94a3b8;">
        Compliant with Coal Mines Regulations 2017 & DGMS Directives
      </div>
    </div>
  `;

  container.querySelector('#btn-role-worker')?.addEventListener('click', () => {
    window.location.hash = '#home';
  });

  container.querySelector('#btn-role-supervisor')?.addEventListener('click', () => {
    window.location.hash = '#supervisor';
  });

  container.querySelector('#btn-role-demo')?.addEventListener('click', () => {
    window.location.hash = '#demo';
  });
}
