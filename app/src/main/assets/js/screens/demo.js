// SIH 2-Minute Judge Demonstration Engine

export function renderDemoScreen(container, state) {
  let demoStep = 1;
  const totalSteps = 6;

  function renderStep() {
    container.innerHTML = `
      <div style="padding-top: 8px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <button id="btn-demo-exit" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
            ✕ Exit Demo
          </button>
          <span style="background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: var(--radius-full);">
            SIH JUDGE DEMO: STEP ${demoStep} OF ${totalSteps}
          </span>
        </div>

        <!-- Step Container -->
        <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 22px; border: 1.5px solid #0284c7; box-shadow: var(--shadow-md); margin-bottom: 20px;">
          ${getStepHTML(demoStep)}
        </div>

        <!-- Demo Controls -->
        <div style="display: flex; gap: 10px;">
          <button id="btn-demo-prev" class="btn-secondary" style="flex: 1;" ${demoStep === 1 ? 'disabled' : ''}>
            ← Previous Step
          </button>
          <button id="btn-demo-next" class="btn-primary" style="flex: 2; background: linear-gradient(135deg, #d97706, #f59e0b); color: #0b1f33; font-weight: 800;">
            ${demoStep === totalSteps ? 'Finish & Open Supervisor Console' : 'Advance Demo Step →'}
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btn-demo-exit')?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    container.querySelector('#btn-demo-prev')?.addEventListener('click', () => {
      if (demoStep > 1) {
        demoStep--;
        renderStep();
      }
    });

    container.querySelector('#btn-demo-next')?.addEventListener('click', () => {
      if (demoStep < totalSteps) {
        demoStep++;
        renderStep();
      } else {
        window.location.hash = '#supervisor';
      }
    });
  }

  function getStepHTML(step) {
    switch (step) {
      case 1:
        return `
          <span style="color: #0284c7; font-size: 11px; font-weight: 800; text-transform: uppercase;">1. The Vocational Problem</span>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 8px 0 10px 0;">Traditional Training Gap in Jharkhand Mines</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px;">
            Underground coal miners in Dhanbad & Jharia rely on passive classroom lectures and infrequent physical drills. In real spontaneous combustion emergencies, workers experience cognitive freezing and cannot react in time.
          </p>
          <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 12px; font-size: 12.5px; border-left: 4px solid #ef4444;">
            <strong>Traditional Deficit:</strong> Zero repeatable neuromuscular memory or millisecond response measurement.
          </div>
        `;
      case 2:
        return `
          <span style="color: #0284c7; font-size: 11px; font-weight: 800; text-transform: uppercase;">2. The Situated AR Solution</span>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 8px 0 10px 0;">Transform Any Room into Dhanbad Seam #4</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px;">
            MINE AR projects 3D volumetric fire, toxic smoke particles, and DGMS acoustic sirens directly into the trainee's visual field using WebXR and Three.js — or in a 3D simulated gallery when camera is unavailable.
          </p>
          <button class="btn-primary" onclick="window.location.hash='#ar'" style="width: 100%; font-size: 13px;">
            📷 Launch Live AR Experience Now
          </button>
        `;
      case 3:
        return `
          <span style="color: #0284c7; font-size: 11px; font-weight: 800; text-transform: uppercase;">3. Client Computer Vision</span>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 8px 0 10px 0;">Real-Time Extinguisher & PPE Tracking</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px;">
            The trainee points their camera at designated training equipment. The client-side CV canvas engine identifies Dry Chemical Powder (DCP) cylinders, displays target lock [DCP 94%], and unlocks interactive deployment.
          </p>
          <div style="background: #ecfdf5; border-radius: var(--radius-md); padding: 12px; font-size: 12.5px; border-left: 4px solid #10b981;">
            <strong>100% Client-Side:</strong> Operates completely offline inside deep underground mines without cloud latency.
          </div>
        `;
      case 4:
        return `
          <span style="color: #0284c7; font-size: 11px; font-weight: 800; text-transform: uppercase;">4. PASS Firefighting Response</span>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 8px 0 10px 0;">Neuromuscular Action Validation</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px;">
            Workers perform: <strong>[P] Pull pin</strong> ➔ <strong>[A] Aim at base</strong> ➔ <strong>[S] Squeeze lever</strong> ➔ <strong>[S] Sweep</strong>. Approaching downwind from the return airway triggers an instant -20 XP penalty warning.
          </p>
          <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 12px; font-size: 12.5px;">
            <strong>Telemetric Timer:</strong> Tracks reaction time to the millisecond. Sub-4 second response unlocks "⚡ Rapid Responder".
          </div>
        `;
      case 5:
        return `
          <span style="color: #0284c7; font-size: 11px; font-weight: 800; text-transform: uppercase;">5. DGMS Competency Index</span>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 8px 0 10px 0;">Mathematical Evaluation Formula</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px;">
            $$C = 0.35 \\cdot \\text{Acc} + 0.30 \\cdot \\text{Speed} + 0.25 \\cdot \\text{Proc} + 0.10 \\cdot \\text{HazRec}$$
            Scoring >= 85% unlocks the verifiable cryptographic DGMS Certificate with QR verification.
          </p>
          <button class="btn-secondary" onclick="window.location.hash='#certificate'" style="width: 100%; font-size: 13px;">
            📜 Inspect Digital Certificate
          </button>
        `;
      case 6:
        return `
          <span style="color: #0284c7; font-size: 11px; font-weight: 800; text-transform: uppercase;">6. Unified Supervisor Console</span>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 8px 0 10px 0;">Workforce Readiness & Retraining Queue</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px;">
            Mine managers in Dhanbad track entire shifts in real time. The automated gap engine flags workers with low scores (e.g. Amit Singh: 58.2%) and queues mandatory retraining modules.
          </p>
          <div style="background: #fef3c7; border-radius: var(--radius-md); padding: 12px; font-size: 12.5px; border-left: 4px solid #d97706;">
            <strong>Ready for Presentation:</strong> Complete unified PWA, offline sync, and FastAPI backend running seamlessly!
          </div>
        `;
      default:
        return '';
    }
  }

  renderStep();
}
