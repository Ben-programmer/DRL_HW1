// ===== STATE =====
let n = 5;
let maxObstacles = 3; // n - 2
let mode = 'start';   // 'start' | 'end' | 'obstacle'
let startCell = null;
let endCell = null;
let obstacles = new Set();

// ===== MODE =====
function setMode(m) {
    mode = m;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('mode' + m.charAt(0).toUpperCase() + m.slice(1)).classList.add('active');

    const modeEl = document.getElementById('currentMode');
    modeEl.textContent = m.toUpperCase();
    modeEl.className = 'info-value mode-' + m;
}

// ===== GENERATE GRID =====
function generateGrid(size) {
    n = size;
    maxObstacles = n - 2;
    startCell = null;
    endCell = null;
    obstacles = new Set();

    const container = document.getElementById('gridContainer');
    container.style.gridTemplateColumns = `repeat(${n}, var(--cell-size))`;
    container.innerHTML = '';

    for (let i = 1; i <= n * n; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.id = i;
        cell.textContent = i;
        cell.addEventListener('click', () => handleCellClick(i, cell));
        container.appendChild(cell);
    }

    // Update info panel
    document.getElementById('gridDim').textContent = `${n} x ${n}`;
    document.getElementById('totalCells').textContent = n * n;
    document.getElementById('maxObs').textContent = maxObstacles;

    // Hide eval section on regenerate
    document.getElementById('evalSection').style.display = 'none';

    updateStatus();
}

// ===== CLICK HANDLER =====
function handleCellClick(id, cell) {
    if (mode === 'start') {
        if (startCell !== null) {
            const old = document.querySelector(`.grid-cell[data-id="${startCell}"]`);
            if (old) old.classList.remove('start');
        }
        if (id === endCell) {
            showToast('Cannot place START on END cell!', 'error');
            return;
        }
        if (obstacles.has(id)) {
            obstacles.delete(id);
            cell.classList.remove('obstacle');
        }
        startCell = id;
        cell.classList.remove('end');
        cell.classList.add('start');
        showToast(`START set to cell ${id}`, 'success');

    } else if (mode === 'end') {
        if (endCell !== null) {
            const old = document.querySelector(`.grid-cell[data-id="${endCell}"]`);
            if (old) old.classList.remove('end');
        }
        if (id === startCell) {
            showToast('Cannot place END on START cell!', 'error');
            return;
        }
        if (obstacles.has(id)) {
            obstacles.delete(id);
            cell.classList.remove('obstacle');
        }
        endCell = id;
        cell.classList.remove('start');
        cell.classList.add('end');
        showToast(`END set to cell ${id}`, 'success');

    } else if (mode === 'obstacle') {
        if (id === startCell || id === endCell) {
            showToast('Cannot place OBSTACLE on START/END!', 'error');
            return;
        }
        if (obstacles.has(id)) {
            obstacles.delete(id);
            cell.classList.remove('obstacle');
            showToast(`Obstacle removed from cell ${id}`, 'success');
        } else {
            if (obstacles.size >= maxObstacles) {
                showToast(`Max ${maxObstacles} obstacles allowed!`, 'error');
                return;
            }
            obstacles.add(id);
            cell.classList.add('obstacle');
            showToast(`Obstacle set at cell ${id}`, 'success');
        }
    }

    updateStatus();
}

// ===== RESET =====
function resetGrid() {
    startCell = null;
    endCell = null;
    obstacles = new Set();
    document.querySelectorAll('.grid-cell').forEach(c => {
        c.classList.remove('start', 'end', 'obstacle');
    });
    document.getElementById('evalSection').style.display = 'none';
    updateStatus();
    showToast('Grid reset!', 'success');
}

// ===== STATUS UPDATE =====
function updateStatus() {
    document.getElementById('startInfo').textContent =
        startCell !== null ? `CELL ${startCell}` : 'NOT SET';
    document.getElementById('endInfo').textContent =
        endCell !== null ? `CELL ${endCell}` : 'NOT SET';
    document.getElementById('obstacleInfo').textContent =
        `${obstacles.size} / ${maxObstacles}`;
}

// ===== EVALUATE =====
async function runEvaluate() {
    if (startCell === null || endCell === null) {
        showToast('Set START and END first!', 'error');
        return;
    }

    const btn = document.getElementById('evaluateBtn');
    btn.classList.add('loading');
    btn.textContent = '⏳ RUNNING...';

    try {
        const res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                n,
                start: startCell,
                end: endCell,
                obstacles: Array.from(obstacles),
            }),
        });
        const data = await res.json();
        renderMatrices(data);
        showToast('Evaluation complete!', 'success');
    } catch (e) {
        showToast('Evaluation failed!', 'error');
    } finally {
        btn.classList.remove('loading');
        btn.textContent = '▶ EVALUATE';
    }
}

// ===== RENDER MATRICES =====
function renderMatrices({ n: N, values, policy }) {
    const startS = startCell - 1;  // 0-based
    const endS = endCell - 1;
    const obsSet = new Set([...obstacles].map(o => o - 1));

    const cellW = Math.max(64, Math.floor(460 / N));
    const cellH = Math.max(44, Math.floor(260 / N));

    // Helper: determine cell type class
    function cellType(s) {
        if (s === startS) return 'm-start';
        if (s === endS) return 'm-end';
        if (obsSet.has(s)) return 'm-obstacle';
        return '';
    }

    // ---- VALUE GRID ----
    const vGrid = document.getElementById('valueGrid');
    vGrid.style.gridTemplateColumns = `repeat(${N}, ${cellW}px)`;
    vGrid.innerHTML = '';

    for (let s = 0; s < N * N; s++) {
        const cell = document.createElement('div');
        cell.classList.add('m-cell', 'val-cell');
        cell.style.width = cellW + 'px';
        cell.style.height = cellH + 'px';

        const type = cellType(s);
        if (type) {
            cell.classList.add(type);
            if (type === 'm-start') cell.innerHTML = '<span>S</span><span class="val-num">' + values[s].toFixed(2) + '</span>';
            else if (type === 'm-end') cell.innerHTML = '<span>G</span><span class="val-num">' + values[s].toFixed(2) + '</span>';
            else cell.innerHTML = '<span>■</span>';
        } else {
            const v = values[s];
            const colorClass = v > 0.05 ? 'val-pos' : v < -0.05 ? 'val-neg' : 'val-zero';
            cell.classList.add(colorClass);
            cell.innerHTML = `<span class="val-num">${v.toFixed(3)}</span>`;
        }
        vGrid.appendChild(cell);
    }

    // ---- POLICY GRID ----
    const pGrid = document.getElementById('policyGrid');
    pGrid.style.gridTemplateColumns = `repeat(${N}, ${cellW}px)`;
    pGrid.innerHTML = '';

    for (let s = 0; s < N * N; s++) {
        const cell = document.createElement('div');
        cell.classList.add('m-cell', 'pol-cell');
        cell.style.width = cellW + 'px';
        cell.style.height = cellH + 'px';

        const type = cellType(s);
        if (type) {
            cell.classList.add(type);
            if (type === 'm-start') cell.textContent = 'S';
            else if (type === 'm-end') cell.textContent = 'G';
            else cell.textContent = '■';
        } else {
            cell.textContent = policy[s] || '';
        }
        pGrid.appendChild(cell);
    }

    // Show section
    const section = document.getElementById('evalSection');
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== TOAST =====
let toastTimer = null;
function showToast(msg, type = '') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    if (toastTimer) clearTimeout(toastTimer);

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);

    toastTimer = setTimeout(() => toast.remove(), 2200);
}

// ===== GENERATE BUTTON =====
document.getElementById('generateBtn').addEventListener('click', () => {
    const val = parseInt(document.getElementById('gridSize').value, 10);
    if (isNaN(val) || val < 5 || val > 9) {
        showToast('Enter a number between 5 and 9!', 'error');
        return;
    }
    generateGrid(val);
    showToast(`${val}x${val} grid generated!`, 'success');
});

// Enter key support
document.getElementById('gridSize').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('generateBtn').click();
});

// ===== INIT =====
generateGrid(5);
setMode('start');
