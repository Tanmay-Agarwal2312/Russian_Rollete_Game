(() => {
      const playerCountEl = document.getElementById('playerCount');
      const namesContainer = document.getElementById('namesContainer');
      const createBtn = document.getElementById('createBtn');
      const resetBtn = document.getElementById('resetBtn');
      const playArea = document.getElementById('playArea');
      const playersPanel = document.getElementById('playersPanel');
      const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
      const remainingCount = document.getElementById('remainingCount');
      const triggerBtn = document.getElementById('triggerBtn');
      const spinBtn = document.getElementById('spinBtn');
      const newGameBtn = document.getElementById('newGameBtn');
      const nextBtn = document.getElementById('nextBtn');
      const statusText = document.getElementById('statusText');
      const bulletsSelect = document.getElementById('bullets');
      const autoSpinSelect = document.getElementById('autoSpin');
      const chamberLabel = document.getElementById('chamberLabel');

      let players = [];
      let alive = [];
      let current = 0;
      let chambers = 6;
      let bulletSlots = [];
      let autoSpin = true;
      let gameActive = false;

      function makeNameInputs() {
        namesContainer.innerHTML = '';
        const n = +playerCountEl.value;
        for (let i=0;i<n;i++){
          const wrapper = document.createElement('div');
          wrapper.style.minWidth = '180px';
          const input = document.createElement('input');
          input.type='text';
          input.placeholder = `Player ${i+1} name (optional)`;
          input.dataset.idx = i;
          input.style.padding='8px';
          input.style.borderRadius='8px';
          input.style.background='rgba(255,255,255,0.02)';
          input.style.border='1px solid rgba(255,255,255,0.03)';
          wrapper.appendChild(input);
          namesContainer.appendChild(wrapper);
        }
      }

      function createGame() {
        const n = +playerCountEl.value;
        players = [];
        alive = [];
        for (let i=0;i<n;i++){
          const input = namesContainer.querySelector(`input[data-idx="${i}"]`);
          const name = input && input.value.trim() ? input.value.trim() : `Player ${i+1}`;
          players.push({name, elim:false});
          alive.push(true);
        }
        current = 0;
        gameActive = true;
        prepareChambers();
        autoSpin = autoSpinSelect.value === 'true';
        updateUIForPlay();
      }

      function prepareChambers() {
        // Build a chamber array of length 6 with bullet count positions set to true
        const b = Math.min(Math.max(+bulletsSelect.value,1),3);
        const arr = new Array(chambers).fill(false);
        // place bullets randomly
        let placed = 0;
        while (placed < b) {
          const idx = Math.floor(Math.random()*chambers);
          if (!arr[idx]) { arr[idx]=true; placed++; }
        }
        bulletSlots = arr;
        // if autoSpin true we will pick random index on each trigger; otherwise we rotate through indices
      }

      function findNextAlive(fromIdx){
        const n = players.length;
        for (let i=0;i<n;i++){
          const idx = (fromIdx + i) % n;
          if (alive[idx]) return idx;
        }
        return -1;
      }

      function updateUIForPlay() {
        playArea.style.display = '';
        playArea.setAttribute('aria-hidden','false');
        renderPlayersPanel();
        updateCurrentDisplay();
        remainingCount.textContent = alive.filter(Boolean).length;
        statusText.innerHTML = 'Press <strong>Trigger</strong> to take a turn.';
        chamberLabel.textContent = autoSpin ? 'Spin' : 'Cylinder';
        nextBtn.style.display = 'none';
      }

      function renderPlayersPanel(){
        playersPanel.innerHTML = '';
        players.forEach((p, idx) => {
          const el = document.createElement('div');
          el.className = 'player-card' + (alive[idx] ? '' : ' eliminated');
          if (idx === current && alive[idx]) el.classList.add('current');
          el.innerHTML = `
            <div>
              <div class="player-name">${escapeHtml(p.name)}</div>
              <div class="player-elim">${alive[idx] ? 'Active' : 'Eliminated'}</div>
            </div>
            <div class="small muted">#${idx+1}</div>
          `;
          playersPanel.appendChild(el);
        });
      }

      function updateCurrentDisplay(){
        const c = findNextAlive(current);
        if (c === -1) {
          currentPlayerDisplay.textContent = '—';
          return;
        }
        current = c;
        currentPlayerDisplay.textContent = players[c].name;
        renderPlayersPanel();
      }

      function triggerShot(){
        if (!gameActive) return;
        const currentIdx = current;
        // decide chamber index
        let chamberIdx = 0;
        if (autoSpin) {
          chamberIdx = Math.floor(Math.random()*chambers);
        } else {
          // deterministic rotate: pick first live chamber index stored on player object (lazy approach)
          // We'll pick a pseudo-rotation by using a global counter stored in currentChamberCounter
          chamberIdx = (window._vr_chamber_counter || 0) % chambers;
          window._vr_chamber_counter = (window._vr_chamber_counter || 0) + 1;
        }

        // animate quick feedback
        chamberLabel.textContent = '...';
        statusText.textContent = `${players[currentIdx].name} is taking the trigger...`;

        // small timeout to dramatize
        setTimeout(() => {
          const isBullet = !!bulletSlots[chamberIdx];
          if (isBullet) {
            // eliminate
            alive[currentIdx] = false;
            players[currentIdx].elim = true;
            renderPlayersPanel();
            remainingCount.textContent = alive.filter(Boolean).length;
            statusText.innerHTML = `<span class="danger">${escapeHtml(players[currentIdx].name)} has been eliminated (virtual).</span>`;
            chamberLabel.textContent = 'BANG';
            // remove bullets from this chamber so same chamber isn't used again by deterministic mode
            bulletSlots[chamberIdx] = false;
            // check for winner(s)
            const survivors = alive.reduce((acc, v, i)=> v ? acc.concat(i): acc, []);
            if (survivors.length <= 1) {
              // game over
              gameActive = false;
              if (survivors.length === 1) {
                const w = players[survivors[0]].name;
                statusText.innerHTML = `<span class="winner">Winner: ${escapeHtml(w)} — game over.</span>`;
              } else {
                statusText.innerHTML = `<span class="muted">No winners — all eliminated.</span>`;
              }
              nextBtn.style.display = 'none';
              triggerBtn.disabled = true;
              spinBtn.disabled = true;
              return;
            } else {
              // continue: move to next alive
              current = findNextAlive(currentIdx+1);
              renderPlayersPanel();
              nextBtn.style.display = '';
              triggerBtn.disabled = true;
              spinBtn.disabled = false;
            }
          } else {
            // safe click
            statusText.innerHTML = `<span class="big">Click! — ${escapeHtml(players[currentIdx].name)} is safe this round.</span>`;
            chamberLabel.textContent = 'CLICK';
            // advance to next alive
            current = findNextAlive(currentIdx+1);
            renderPlayersPanel();
            nextBtn.style.display = '';
            triggerBtn.disabled = true;
            spinBtn.disabled = false;
          }
        }, 700);
      }

      function spinCylinder(){
        // reshuffle bullets for fairness
        prepareChambers();
        statusText.textContent = 'Cylinder spun. Ready.';
        chamberLabel.textContent = 'Spin';
        triggerBtn.disabled = false;
        spinBtn.disabled = false;
        nextBtn.style.display = 'none';
      }

      function nextPlayer(){
        triggerBtn.disabled = false;
        nextBtn.style.display = 'none';
        spinBtn.disabled = false;
        statusText.textContent = `It's ${players[current].name}'s turn. Press Trigger when ready.`;
      }

      function resetAll(){
        // reload page configuration
        playArea.style.display = 'none';
        playArea.setAttribute('aria-hidden','true');
        players = [];
        alive = [];
        current = 0;
        bulletSlots = [];
        gameActive = false;
        playersPanel.innerHTML = '';
        currentPlayerDisplay.textContent = '—';
        remainingCount.textContent = '—';
        statusText.textContent = 'Press Create Game to begin.';
      }

      function escapeHtml(s){
        return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
      }

      // events
      playerCountEl.addEventListener('change', makeNameInputs);
      createBtn.addEventListener('click', () => {
        createGame();
      });
      resetBtn.addEventListener('click', () => {
        resetAll();
        makeNameInputs();
      });
      triggerBtn.addEventListener('click', () => {
        // disable immediate re-trigger to avoid double clicks
        triggerBtn.disabled = true;
        spinBtn.disabled = true;
        triggerShot();
      });
      spinBtn.addEventListener('click', () => {
        spinCylinder();
      });
      nextBtn.addEventListener('click', () => {
        nextPlayer();
      });
      newGameBtn.addEventListener('click', () => {
        // quick reset to allow new configuration
        resetAll();
        makeNameInputs();
      });

      // initial setup
      makeNameInputs();
      resetAll();
    })();