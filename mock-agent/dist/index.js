import { createServer } from 'http';
import { randomBytes } from 'crypto';
const PORT = 7337;
const BIND_ADDRESS = '127.0.0.1';
let PAIRING_TOKEN = randomBytes(16).toString('hex');
console.log(`\n📊 Methodica Mock Analysis Agent`);
console.log(`🔑 Pairing Token: ${PAIRING_TOKEN}`);
console.log(`🚀 Server: http://${BIND_ADDRESS}:${PORT}\n`);
async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            }
            catch {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}
function validateToken(req) {
    const token = req.headers['x-methodica-token'];
    return token === PAIRING_TOKEN;
}
const server = createServer(async (req, res) => {
    // Only allow local connections
    const clientIp = req.socket.remoteAddress;
    if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Access denied: non-local traffic' }));
        return;
    }
    const method = req.method;
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const pathname = url.pathname;
    // CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Methodica-Token, X-CSRF-Token');
    // Handle OPTIONS preflight (no auth required)
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    // /health and /ping do not require auth (liveness checks)
    const isPublicEndpoint = pathname === '/health' || pathname === '/ping';
    // Validate token for protected endpoints
    if (!isPublicEndpoint && !validateToken(req)) {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid or missing pairing token' }));
        return;
    }
    res.setHeader('Content-Type', 'application/json');
    try {
        if (pathname === '/health' && method === 'POST') {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'healthy', version: '1.0.0' }));
        }
        else if (pathname === '/dataset/parse' && method === 'POST') {
            const body = await parseBody(req);
            const mockSchema = {
                columns: [
                    { name: 'group', type: 'categorical', non_null_count: 20, null_count: 0 },
                    { name: 'value', type: 'numeric', non_null_count: 20, null_count: 0 },
                ],
                n_rows: 20,
                candidate_x: [],
                candidate_y: ['value'],
                candidate_group: ['group'],
                has_replicates_hint: false,
                paired_hint: false,
                control_group: undefined,
                is_paired: false,
                are_biological_replicates: true,
            };
            res.writeHead(200);
            res.end(JSON.stringify({ schema: mockSchema, warnings: [] }));
        }
        else if (pathname === '/dataset/summarize' && method === 'POST') {
            const body = await parseBody(req);
            const mockSummaries = {
                group: {
                    control: { n: 10, mean: 100, sd: 15 },
                    treatment: { n: 10, mean: 135, sd: 18 },
                },
                value: {
                    min: 65,
                    max: 165,
                    mean: 117.5,
                    median: 120,
                    sd: 22,
                },
            };
            res.writeHead(200);
            res.end(JSON.stringify({ summaries: mockSummaries }));
        }
        else if (pathname === '/plan/validate' && method === 'POST') {
            const body = await parseBody(req);
            res.writeHead(200);
            res.end(JSON.stringify({
                is_valid: true,
                errors: [],
                warnings: [
                    {
                        id: 'warn_001',
                        severity: 'info',
                        message: 'Small sample size may limit statistical power',
                        recommended_action: 'Consider collecting more replicates',
                        evidence: 'n=10 per group',
                    },
                ],
                risk_level: 'none',
            }));
        }
        else if (pathname === '/run' && method === 'POST') {
            const body = await parseBody(req);
            const mockResult = {
                results_json: {
                    test_type: 't-test',
                    test_statistic: 3.52,
                    p_value: 0.0038,
                    effect_size: 1.58,
                    ci_lower: 20.5,
                    ci_upper: 49.5,
                    mean_diff: 35.0,
                },
                warnings_json: [],
                diagnostics_json: {
                    normality_test: {
                        control: { statistic: 0.95, p_value: 0.45 },
                        treatment: { statistic: 0.92, p_value: 0.38 },
                    },
                    homogeneity: { levene_p: 0.62 },
                },
                plot_spec_json: {
                    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                    width: 400,
                    height: 300,
                    data: {
                        values: [
                            { group: 'Control', value: 95 },
                            { group: 'Control', value: 105 },
                            { group: 'Control', value: 98 },
                            { group: 'Control', value: 108 },
                            { group: 'Control', value: 102 },
                            { group: 'Control', value: 100 },
                            { group: 'Control', value: 97 },
                            { group: 'Control', value: 110 },
                            { group: 'Control', value: 104 },
                            { group: 'Control', value: 101 },
                            { group: 'Treatment', value: 132 },
                            { group: 'Treatment', value: 140 },
                            { group: 'Treatment', value: 135 },
                            { group: 'Treatment', value: 142 },
                            { group: 'Treatment', value: 138 },
                            { group: 'Treatment', value: 130 },
                            { group: 'Treatment', value: 145 },
                            { group: 'Treatment', value: 136 },
                            { group: 'Treatment', value: 134 },
                            { group: 'Treatment', value: 141 },
                        ],
                    },
                    mark: 'point',
                    encoding: {
                        x: { field: 'group', type: 'nominal', title: 'Group' },
                        y: { field: 'value', type: 'quantitative', title: 'Value' },
                        color: { field: 'group', type: 'nominal', legend: false },
                    },
                },
                methods_text: 'Two-sample t-test was performed to compare means between groups. Data were first assessed for normality using Shapiro-Wilk test and homogeneity of variance using Levene test.',
                explain_bundle: {
                    equations: 't = (μ₁ - μ₂) / √(s₁²/n₁ + s₂²/n₂)',
                    citations: [
                        {
                            id: 'welch1947',
                            title: 'The generalization of Student\'s problem when several different population variances are involved',
                            authors: 'Welch, B.L.',
                            year: 1947,
                            doi: '10.1093/biomet/34.1-2.28',
                        },
                    ],
                    critique: [
                        'Small sample sizes reduce statistical power',
                        'Assumes independent samples',
                    ],
                },
            };
            res.writeHead(200);
            res.end(JSON.stringify(mockResult));
        }
        else if (pathname === '/export' && method === 'POST') {
            const body = await parseBody(req);
            const format = body.format || 'png';
            if (format === 'png') {
                res.setHeader('Content-Type', 'image/png');
                res.writeHead(200);
                res.end(Buffer.from('PNG_DATA_PLACEHOLDER'));
            }
            else if (format === 'svg') {
                res.setHeader('Content-Type', 'image/svg+xml');
                res.writeHead(200);
                res.end('<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><text x="50" y="150">SVG Export Stub</text></svg>');
            }
            else if (format === 'pdf') {
                res.setHeader('Content-Type', 'application/pdf');
                res.writeHead(200);
                res.end(Buffer.from('PDF_DATA_PLACEHOLDER'));
            }
            else {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Unsupported format' }));
            }
        }
        else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    }
    catch (error) {
        console.error('Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});
server.listen(PORT, BIND_ADDRESS, () => {
    console.log(`✅ Agent listening on http://${BIND_ADDRESS}:${PORT}`);
});
