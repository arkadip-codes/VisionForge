// Activities Screen: Interactive Vocational Drills with Attempt Logging

import { speak, playSuccessChime, playPenaltyBuzz } from '../voice.js';

export async function renderActivitiesScreen(container, state) {
  let activities = [];
  try {
    const resp = await fetch('/api/v1/activities');
    if (resp.ok) {
      activities = await resp.json();
    }
  } catch (e) {
    console.warn('Could not fetch activities from API, using fallback:', e);
  }

  if (!activities || activities.length === 0) {
    activities = [
      {
        id: "act_fire_extinguisher",
        title: "Fire Extinguisher Selection",
        category: "Fire Safety",
        description: "Select certified firefighting agent for underground conveyor drive motor and coal accumulation.",
        question: "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
        options: ["Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", "Foam Extinguisher", "Carbon Dioxide in Return Airway"],
        correct_answer: "Dry Chemical Powder (DCP - IS 2171)",
        explanation: "Dry Chemical Powder non-conductively interrupts the chemical chain reaction and smothers coal dust without causing an electrical conduction hazard."
      },
      {
        id: "act_ventilation_airway",
        title: "Ventilation Airway Positioning",
        category: "Ventilation",
        description: "Identify statutory upwind positioning during fire and smoke suppression.",
        question: "When approaching a smoldering conveyor friction fire, which airway position provides safety from toxic Carbon Monoxide (CO)?",
        options: ["Return Airway (Downwind)", "Intake Airway (Upwind)", "Directly Underneath Belt Drive", "Neutral Airway"],
        correct_answer: "Intake Airway (Upwind)",
        explanation: "Intake Airway supplies fresh atmospheric air traveling past the firefighter toward the fire, carrying heat, dense smoke, and toxic carbon monoxide away."
      },
      {
        id: "act_methane_threshold",
        title: "Methane Threshold Action",
        category: "Gas Monitoring",
        description: "Statutory DGMS response when inflammable gas reaches critical limits.",
        question: "Under DGMS Coal Mines Regulation 169, what mandatory action is required if inflammable gas reaches 1.25% in the working face?",
        options: ["Continue work but turn on water mist", "Open compressed air valve to dilute gas", "Cut electric power and immediately withdraw team to intake air", "Ignore until gas reaches 5%"],
        correct_answer: "Cut electric power and immediately withdraw team to intake air",
        explanation: "At 1.25% methane (CH4), electrical power supply must be isolated immediately and all personnel withdrawn to fresh air until competent sirdar certifies safety."
      }
    ];
  }

  let selectedActivity = null;
  let startTime = null;

  function renderListView() {
    container.innerHTML = `
      <div style="padding-top: 8px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-activities-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
              ← Back
            </button>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Activities & Drills</h2>
          </div>
          <button id="btn-view-all-history" class="btn-primary" style="padding: 6px 14px; font-size: 12px; background: linear-gradient(135deg, #0284c7, #1e3a8a);">
            📜 View My History
          </button>
        </div>

        <!-- History Prompt Banner -->
        <div style="background: linear-gradient(135deg, #e0f2fe, #bae6fd); border: 1px solid #7dd3fc; border-radius: var(--radius-xl); padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 11px; font-weight: 800; color: #0369a1; text-transform: uppercase;">COMPLETE ATTEMPT LOGGING</span>
            <div style="font-size: 13.5px; font-weight: 700; color: #0c4a6e; margin-top: 2px;">
              All previous answers, scores & improvements are preserved!
            </div>
          </div>
          <button id="btn-banner-history" class="btn-secondary" style="font-size: 11px; padding: 6px 12px; border-color: #0284c7; color: #0369a1; font-weight: 700;">
            Inspect Log ➔
          </button>
        </div>

        <!-- Activities List -->
        <h3 class="section-title">Available Vocational Drills</h3>
        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
          ${activities.map((act, idx) => `
            <div class="training-card" data-act-id="${act.id}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <span style="background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: var(--radius-full);">
                  ${act.category}
                </span>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">+15 XP</span>
              </div>
              <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                ${act.title}
              </h4>
              <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
                ${act.description}
              </p>
              <button class="btn-primary" style="width: 100%; padding: 10px; font-size: 13px;">
                Start Activity Attempt ➔
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelector('#btn-activities-back')?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    container.querySelector('#btn-view-all-history')?.addEventListener('click', () => {
      window.location.hash = '#activity-history';
    });

    container.querySelector('#btn-banner-history')?.addEventListener('click', () => {
      window.location.hash = '#activity-history';
    });

    container.querySelectorAll('[data-act-id]').forEach(card => {
      card.addEventListener('click', () => {
        const aid = card.getAttribute('data-act-id');
        selectedActivity = activities.find(a => a.id === aid);
        renderDrillView();
      });
    });
  }

  function renderDrillView() {
    startTime = performance.now();
    const act = selectedActivity;

    container.innerHTML = `
      <div style="padding-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <button id="btn-drill-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
            ← Activities
          </button>
          <span style="font-size: 11px; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: var(--radius-full);">
            ${act.category}
          </span>
        </div>

        <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
            ${act.title}
          </h3>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 16px;">
            Read carefully and select the single correct statutory procedure.
          </p>

          <!-- Question Box -->
          <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">QUESTION</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.45;">
              ${act.question}
            </div>
          </div>

          <!-- Options List -->
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;" id="drill-options">
            ${act.options.map((opt, oIdx) => `
              <button class="deck-btn" data-drill-opt="${opt}" style="text-align: left; padding: 14px; font-size: 13px; color: #1e293b; background: #f8fafc; border: 1px solid #cbd5e1; line-height: 1.4;">
                ${opt}
              </button>
            `).join('')}
          </div>

          <!-- Live Feedback Slot -->
          <div id="drill-feedback" style="display: none; padding: 14px; border-radius: var(--radius-md); font-size: 13px; line-height: 1.5; margin-bottom: 14px;"></div>

          <div id="drill-action-footer" style="display: none; display: flex; gap: 10px;">
            <button id="btn-see-history-now" class="btn-primary" style="flex: 1; font-size: 13px;">
              📜 Inspect in Activity History
            </button>
            <button id="btn-retry-drill" class="btn-secondary" style="flex: 1; font-size: 13px;">
              🔄 Try Drill Again
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-drill-back')?.addEventListener('click', () => {
      renderListView();
    });

    const fbSlot = container.querySelector('#drill-feedback');
    const footerSlot = container.querySelector('#drill-action-footer');

    container.querySelectorAll('[data-drill-opt]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const selected = btn.getAttribute('data-drill-opt');
        const elapsedSec = Math.round(((performance.now() - startTime) / 1000) * 10) / 10;

        container.querySelectorAll('[data-drill-opt]').forEach(b => b.disabled = true);

        // Submit to Backend API
        let attemptRes = null;
        try {
          const resp = await fetch(`/api/v1/activities/${act.id}/attempt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trainee_id: state.worker?.id || 'suresh_01',
              activity_id: act.id,
              selected_answer: selected,
              time_taken_sec: elapsedSec
            })
          });
          if (resp.ok) {
            attemptRes = await resp.json();
            if (state.worker) state.worker.xp = attemptRes.new_xp;
          }
        } catch (e) {
          console.warn('Offline activity attempt save:', e);
        }

        const isCorrect = selected.trim().toLowerCase() === act.correct_answer.trim().toLowerCase();

        fbSlot.style.display = 'block';
        footerSlot.style.display = 'flex';

        if (isCorrect) {
          btn.style.borderColor = '#10b981';
          btn.style.background = '#d1fae5';
          fbSlot.style.background = '#d1fae5';
          fbSlot.style.color = '#065f46';
          fbSlot.innerHTML = `
            <strong>✓ Correct Answer! (+15 XP)</strong><br>
            Time taken: ${elapsedSec}s • Attempt #${attemptRes?.attempt_number || 1}<br>
            <em>${act.explanation}</em>
            ${attemptRes?.improvement_notes ? `<br><br><strong>Note:</strong> ${attemptRes.improvement_notes}` : ''}
          `;
          playSuccessChime();
          speak("Correct response. Your answer has been saved to your activity history.");
        } else {
          btn.style.borderColor = '#ef4444';
          btn.style.background = '#fee2e2';
          fbSlot.style.background = '#fee2e2';
          fbSlot.style.color = '#991b1b';
          fbSlot.innerHTML = `
            <strong>❌ Incorrect Answer (-10 XP)</strong><br>
            Your answer: <em>${selected}</em><br>
            Correct answer: <strong>${act.correct_answer}</strong><br><br>
            <strong>Why:</strong> ${act.explanation}
          `;
          playPenaltyBuzz();
          speak("Incorrect. Both this attempt and the correct solution have been logged in your history.");
        }

        container.querySelector('#btn-see-history-now')?.addEventListener('click', () => {
          window.location.hash = '#activity-history';
        });

        container.querySelector('#btn-retry-drill')?.addEventListener('click', () => {
          renderDrillView();
        });
      });
    });
  }

  renderListView();
}
