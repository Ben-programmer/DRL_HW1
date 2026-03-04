from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

ACTIONS = ['U', 'D', 'L', 'R']  # Up, Down, Left, Right
ARROW = {'U': '↑', 'D': '↓', 'L': '←', 'R': '→'}

def get_neighbors(s, n, action):
    """Return next state given action on an n×n grid (row-major, 0-indexed)."""
    row, col = divmod(s, n)
    if action == 'U':
        row2 = max(row - 1, 0)
        col2 = col
    elif action == 'D':
        row2 = min(row + 1, n - 1)
        col2 = col
    elif action == 'L':
        row2 = row
        col2 = max(col - 1, 0)
    else:  # R
        row2 = row
        col2 = min(col + 1, n - 1)
    return row2 * n + col2


def policy_evaluation(n, start, end, obstacle_set,
                       gamma=0.9, theta=1e-6, max_iter=2000):
    """
    Iterative policy evaluation with a random (uniform) policy.
    - Reward: +1.0 on reaching end, -1.0 on reaching obstacle, -0.04 otherwise.
    - start/end/obstacles are 1-based cell ids (as sent from frontend).
    Returns: V list (length n*n), policy list of arrow chars.
    """
    total = n * n
    # Convert 1-based ids to 0-based state indices
    start_s = start - 1
    end_s   = end - 1
    obs_s   = {o - 1 for o in obstacle_set}

    # Terminal states: end + obstacles
    terminal = obs_s | {end_s}

    # Random policy: each state gets a random action (fixed)
    policy = [random.choice(ACTIONS) for _ in range(total)]
    # Terminal states policy doesn't matter
    for s in terminal:
        policy[s] = random.choice(ACTIONS)

    # Value function init
    V = [0.0] * total
    V[end_s] = 1.0
    for s in obs_s:
        V[s] = -1.0

    # Iterative policy evaluation
    for _ in range(max_iter):
        delta = 0.0
        new_V = V[:]
        for s in range(total):
            if s in terminal:
                continue
            # Uniform random policy: average over all 4 actions
            val = 0.0
            for a in ACTIONS:
                s2 = get_neighbors(s, n, a)
                if s2 == end_s:
                    r = 1.0
                elif s2 in obs_s:
                    r = -1.0
                else:
                    r = -0.04
                val += 0.25 * (r + gamma * V[s2])
            new_V[s] = val
            delta = max(delta, abs(new_V[s] - V[s]))
        V = new_V
        if delta < theta:
            break

    # Greedy policy from V
    greedy = []
    for s in range(total):
        if s in terminal:
            greedy.append(None)
            continue
        best_a = None
        best_v = float('-inf')
        for a in ACTIONS:
            s2 = get_neighbors(s, n, a)
            if s2 == end_s:
                r = 1.0
            elif s2 in obs_s:
                r = -1.0
            else:
                r = -0.04
            q = r + gamma * V[s2]
            if q > best_v:
                best_v = q
                best_a = a
        greedy.append(ARROW[best_a])

    return V, greedy


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/grid', methods=['POST'])
def generate_grid():
    data = request.json
    n = data.get('n', 5)
    n = max(5, min(9, int(n)))
    return jsonify({'n': n, 'obstacles': n - 2})

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    n         = max(5, min(9, int(data.get('n', 5))))
    start     = int(data.get('start', 1))
    end       = int(data.get('end', n * n))
    obstacles = [int(o) for o in data.get('obstacles', [])]

    V, greedy = policy_evaluation(n, start, end, set(obstacles))

    return jsonify({
        'n': n,
        'values': [round(v, 3) for v in V],
        'policy': greedy,           # list of '↑'/'↓'/'←'/'→' or None
    })

if __name__ == '__main__':
    app.run(debug=True)
