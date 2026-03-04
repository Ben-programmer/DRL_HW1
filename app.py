from flask import Flask, render_template, request, jsonify

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


def value_iteration(n, start, end, obstacle_set,
                    gamma=0.9, theta=1e-6, max_iter=10000):
    """
    Value Iteration to compute optimal value function V*(s) and policy π*(s).
    - Reward: +1.0 on reaching end, -1.0 on reaching obstacle, -0.04 otherwise.
    - start/end/obstacles are 1-based cell ids (as sent from frontend).
    Returns: V list (length n*n), policy list of arrow chars (or None for terminals).
    """
    total = n * n
    start_s = start - 1
    end_s   = end - 1
    obs_s   = {o - 1 for o in obstacle_set}

    terminal = obs_s | {end_s}

    # Init V: terminals get their fixed values
    V = [0.0] * total
    V[end_s] = 1.0
    for s in obs_s:
        V[s] = -1.0

    # Value Iteration: V(s) = max_a [ R(s,a) + gamma * V(s') ]
    for _ in range(max_iter):
        delta = 0.0
        new_V = V[:]
        for s in range(total):
            if s in terminal:
                continue
            best_val = float('-inf')
            for a in ACTIONS:
                s2 = get_neighbors(s, n, a)
                if s2 == end_s:
                    r = 1.0
                elif s2 in obs_s:
                    r = -1.0
                else:
                    r = -0.04
                q = r + gamma * V[s2]
                if q > best_val:
                    best_val = q
            new_V[s] = best_val
            delta = max(delta, abs(new_V[s] - V[s]))
        V = new_V
        if delta < theta:
            break

    # Extract greedy policy from V*
    policy = []
    for s in range(total):
        if s in terminal:
            policy.append(None)
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
        policy.append(ARROW[best_a])

    return V, policy


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

    V, policy = value_iteration(n, start, end, set(obstacles))

    return jsonify({
        'n': n,
        'values': [round(v, 4) for v in V],
        'policy': policy,   # list of '↑'/'↓'/'←'/'→' or None
    })

if __name__ == '__main__':
    app.run(debug=True)
