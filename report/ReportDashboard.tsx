import React, { useState } from 'react';

// Types for Project 5 Helpdesk Report
interface MetadataRow {
  clip_id: string;
  speaker_id: string;
  region: string;
  device: string;
  duration_sec: number;
  sample_rate: number;
  sha256_hash: string;
  intent: string;
}

interface ValidationCheck {
  id: number;
  name: string;
  description: string;
  rawStatus: 'PASSED' | 'FAILED';
  rawDetails: string;
  cleanStatus: 'PASSED' | 'SKIPPED';
  cleanDetails: string;
}

interface DisagreementCase {
  clip_id: string;
  annotator_a: string;
  annotator_b: string;
  resolution: string;
}

export const ReportDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'collection' | 'validation' | 'labelling' | 'augmentation' | 'splits' | 'handoff'>('overview');

  const validationChecks: ValidationCheck[] = [
    { id: 1, name: 'test_sample_rate', description: 'Sample rate == 16,000 Hz', rawStatus: 'PASSED', rawDetails: '16 kHz preserved', cleanStatus: 'PASSED', cleanDetails: 'All 249 clips valid' },
    { id: 2, name: 'test_channels', description: 'Single channel mono (channels == 1)', rawStatus: 'PASSED', rawDetails: 'Mono audio', cleanStatus: 'PASSED', cleanDetails: 'All 249 clips mono' },
    { id: 3, name: 'test_duration_bounds', description: '1.0s <= duration <= 30.0s bounds', rawStatus: 'PASSED', rawDetails: 'Segmentation applied', cleanStatus: 'PASSED', cleanDetails: 'Min 6.07s, Max 28.25s' },
    { id: 4, name: 'test_no_clipping', description: 'Max absolute amplitude < 0.99', rawStatus: 'FAILED', rawDetails: 'Raw smartphone mic clipping', cleanStatus: 'PASSED', cleanDetails: 'Normalized peak to 0.88' },
    { id: 5, name: 'test_silence_ratio', description: 'Silent frames fraction < 0.50', rawStatus: 'FAILED', rawDetails: 'Long lead-in pauses', cleanStatus: 'PASSED', cleanDetails: 'Trimmed and ambient calibrated' },
    { id: 6, name: 'test_snr_estimate', description: 'Estimated SNR >= 5.0 dB', rawStatus: 'PASSED', rawDetails: 'Clear speech acoustics', cleanStatus: 'PASSED', cleanDetails: 'SNR >= 6.8 dB across all' },
    { id: 7, name: 'test_no_duplicate_hashes', description: 'Zero duplicate SHA-256 hashes', rawStatus: 'PASSED', rawDetails: 'No identical clips', cleanStatus: 'PASSED', cleanDetails: '249 unique hashes' },
    { id: 8, name: 'test_transcript_chars', description: 'Valid UTF-8 code-mixed charset', rawStatus: 'PASSED', rawDetails: 'Latin, Devanagari, Gujarati', cleanStatus: 'PASSED', cleanDetails: 'No illegal control characters' },
    { id: 9, name: 'test_chars_per_second', description: 'Human speech rate: 5 <= CPS <= 40', rawStatus: 'FAILED', rawDetails: 'Duration-text mismatch (<5 CPS)', cleanStatus: 'PASSED', cleanDetails: 'Aligned to ~12 CPS' },
    { id: 10, name: 'test_lang_id_valid', description: 'Detected lang in {en, hi, gu}', rawStatus: 'PASSED', rawDetails: 'Optional gate', cleanStatus: 'SKIPPED', cleanDetails: 'Optional validator' }
  ];

  const sampleDisagreements: DisagreementCase[] = [
    {
      clip_id: 'P1_1',
      annotator_a: 'admissions (MTech application deadline query)',
      annotator_b: 'it_support (Confused due to portal submission wording)',
      resolution: 'Classified as admissions per v2 rules: questions on deadlines and eligibility map to admissions.'
    },
    {
      clip_id: 'P13_seg012',
      annotator_a: 'hostel_mess (Mess rebate refund inquiry)',
      annotator_b: 'it_support (Misidentified due to online refund portal mention)',
      resolution: 'Classified as hostel_mess: payment/rebate policies belong to hostel management, not IT hardware.'
    },
    {
      clip_id: 'P18_seg003',
      annotator_a: 'student_services (Bonafide certificate for passport)',
      annotator_b: 'it_support (Logged as portal ticket issue)',
      resolution: 'Classified as student_services: administrative documentation belongs to Dean of Academic Affairs.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Header Banner */}
      <header className="max-w-7xl mx-auto border-b border-slate-800 pb-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white">CS203 Project 5</span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">Tag: a1-final</span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-950 text-purple-400 border border-purple-800">IIT Gandhinagar</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Cross-Lingual Institute Voice Helpdesk Pipeline
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Data Collection, Automated Validation, Agreement Protocols & Provenance Report
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p><strong className="text-slate-200">Authors:</strong> Rajdeep Vraj, Vipul Sunil Patil, Satvik Sharma</p>
            <p><strong className="text-slate-200">Repository:</strong> github.com/vipulSP2108/STTAI_Project</p>
            <p className="text-emerald-400 mt-1 font-mono">100% Validation Passed • 249 Clips • 1.28h</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 mt-6">
          {[
            { id: 'overview', label: 'Overview & Architecture' },
            { id: 'collection', label: 'A: Audio Collection' },
            { id: 'validation', label: 'B: 10-Check Validation' },
            { id: 'labelling', label: 'C: Labelling & Agreement' },
            { id: 'augmentation', label: 'D: Augmentation & AL' },
            { id: 'splits', label: 'E: Splits & Leakage' },
            { id: 'handoff', label: 'F: Handoff & Card' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <section className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-xs font-semibold uppercase">Total Clips</div>
                <div className="text-3xl font-black text-white mt-1">249</div>
                <div className="text-xs text-emerald-400 mt-1">↑ 100% in [1.0s, 30.0s] bounds</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-xs font-semibold uppercase">Total Speech Duration</div>
                <div className="text-3xl font-black text-white mt-1">1.28 <span className="text-sm font-normal text-slate-400">hrs</span></div>
                <div className="text-xs text-slate-400 mt-1">4,625.1 seconds canonical audio</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-xs font-semibold uppercase">Unique Speakers</div>
                <div className="text-3xl font-black text-white mt-1">19</div>
                <div className="text-xs text-blue-400 mt-1">Exceeds requirement (≥ 15)</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-xs font-semibold uppercase">Consensus Gold Clips</div>
                <div className="text-3xl font-black text-white mt-1">119</div>
                <div className="text-xs text-purple-400 mt-1">WER = 0.000 consensus frozen</div>
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-2">End-to-End Data Pipeline Flow</h2>
              <p className="text-xs text-slate-400 mb-4">
                Raw recordings from <code className="text-blue-400">Records/</code> are dynamically ingested, validated, annotated in Label Studio, and partitioned into speaker-disjoint splits.
              </p>
              <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex justify-center p-2">
                <img src="figures/data_pipeline_flowchart.png" alt="Data Pipeline Flowchart" className="max-w-full h-auto object-contain" />
              </div>
            </div>

            {/* Assignment Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Project 5 Highlights</h3>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>Code-Mixed Multilingual:</strong> Balanced queries across English, Hindi, and Gujarati.</li>
                  <li><strong>Phone & WhatsApp Ingestion:</strong> Dynamically ingests 6 audio containers (.m4a, .opus, .ogg, .mp4, etc.) without altering raw source folders.</li>
                  <li><strong>Non-Trivial Automated Gate:</strong> 10-check test suite catches digital clipping, speech pauses, and character corruptions.</li>
                  <li><strong>Guaranteed Speaker Disjointness:</strong> Zero speaker leakage between training (13 spk), validation (2 spk), and test (4 spk).</li>
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Submission Deliverables</h3>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>Git Release:</strong> Frozen under commit <code className="text-emerald-400">c033498</code> and tag <code className="text-emerald-400">a1-final</code>.</li>
                  <li><strong>Reproducibility:</strong> One-command data pipeline rebuilding in &lt; 5 commands.</li>
                  <li><strong>Cryptographic Provenance:</strong> Every single WAV clip is tracked with a 64-char SHA-256 hash.</li>
                  <li><strong>A2 Readiness:</strong> Baseline digests frozen in <code className="text-blue-400">HANDOFF_A2.md</code> for Assignment 2 drift tracking.</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: COLLECTION */}
        {activeTab === 'collection' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
                <h2 className="text-lg font-bold text-white mb-2">Duration Distribution (Bounds Checked)</h2>
                <p className="text-xs text-slate-400 mb-4">
                  Energy-based silence segmentation successfully divided session recordings into natural queries ranging from 6.07s to 28.25s (mean 18.57s).
                </p>
                <img src="figures/duration_distribution.png" alt="Duration Distribution" className="rounded-lg border border-slate-800 w-full" />
              </div>
              <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
                <h2 className="text-lg font-bold text-white mb-2">Canonical Audio Waveform & Spectrogram</h2>
                <p className="text-xs text-slate-400 mb-4">
                  Normalized 16\,000 Hz mono PCM WAV sample with preserved 0--8 kHz speech formants and calibrated ambient presence.
                </p>
                <img src="figures/audio_waveform_sample.png" alt="Waveform Sample" className="rounded-lg border border-slate-800 w-full" />
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Speaker Ingestion Matrix (Records/ Directory)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-200">
                    <tr>
                      <th className="p-2.5">Speaker</th>
                      <th className="p-2.5">Region</th>
                      <th className="p-2.5">Raw Containers</th>
                      <th className="p-2.5">Ingested Clips</th>
                      <th className="p-2.5">Total Duration</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr><td className="p-2 font-mono">P1 - P3</td><td className="p-2">Gujarat</td><td className="p-2 font-mono">.m4a, .opus</td><td className="p-2">26 clips</td><td className="p-2">8.34 min</td><td className="p-2 text-emerald-400 font-semibold">Ingested &amp; Verified</td></tr>
                    <tr><td className="p-2 font-mono">P4</td><td className="p-2">Maharashtra (Cohort B)</td><td className="p-2 font-mono">.opus</td><td className="p-2">18 clips</td><td className="p-2">5.53 min</td><td className="p-2 text-blue-400 font-semibold">Held-out Shift Group</td></tr>
                    <tr><td className="p-2 font-mono">P5 - P6</td><td className="p-2">North India</td><td className="p-2 font-mono">.opus</td><td className="p-2">24 clips</td><td className="p-2">7.25 min</td><td className="p-2 text-emerald-400 font-semibold">Ingested &amp; Verified</td></tr>
                    <tr><td className="p-2 font-mono">P7 - P8</td><td className="p-2">Gujarat, Rajasthan</td><td className="p-2 font-mono">.opus, .ogg</td><td className="p-2">72 clips</td><td className="p-2">22.81 min</td><td className="p-2 text-emerald-400 font-semibold">Ingested &amp; Verified</td></tr>
                    <tr><td className="p-2 font-mono">P9 - P12</td><td className="p-2">South India, Gujarat</td><td className="p-2 font-mono">.opus</td><td className="p-2">52 clips</td><td className="p-2">16.32 min</td><td className="p-2 text-emerald-400 font-semibold">Ingested &amp; Verified</td></tr>
                    <tr><td className="p-2 font-mono">P13</td><td className="p-2">Maharashtra (Cohort B)</td><td className="p-2 font-mono">.mp4</td><td className="p-2">14 clips</td><td className="p-2">3.80 min</td><td className="p-2 text-blue-400 font-semibold">Held-out Shift Group</td></tr>
                    <tr><td className="p-2 font-mono">P14 - P19</td><td className="p-2">Various Regions</td><td className="p-2 font-mono">.aac, .mpeg, .ogg</td><td className="p-2">43 clips</td><td className="p-2">13.04 min</td><td className="p-2 text-emerald-400 font-semibold">Ingested &amp; Verified</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: VALIDATION */}
        {activeTab === 'validation' && (
          <section className="space-y-6">
            <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">The 10-Check Automated Validation Gate</h2>
                  <p className="text-xs text-slate-400">
                    Comparison between Raw Data failures (<code className="text-red-400">before.json</code>) and Calibrated Cleaned Data (<code className="text-emerald-400">after.json</code>).
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Pytest Pass Rate: 100%
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-200">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Check Function</th>
                      <th className="p-2.5">Specification</th>
                      <th className="p-2.5">Raw Ingestion (Before)</th>
                      <th className="p-2.5">Clean Data (After)</th>
                      <th className="p-2.5">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {validationChecks.map((chk) => (
                      <tr key={chk.id} className="hover:bg-slate-800/30">
                        <td className="p-2 font-bold text-slate-500">{chk.id}</td>
                        <td className="p-2 font-mono text-blue-400 font-semibold">{chk.name}</td>
                        <td className="p-2 text-slate-300">{chk.description}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            chk.rawStatus === 'PASSED' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                          }`}>
                            {chk.rawStatus}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-1.5">{chk.rawDetails}</span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            chk.cleanStatus === 'PASSED' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {chk.cleanStatus}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-1.5">{chk.cleanDetails}</span>
                        </td>
                        <td className="p-2 text-emerald-400 font-semibold">✓ Verified</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Adversarial Corruption Test Panel */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Adversarial Corruption Suite (<code className="text-blue-400">corruption_test.py</code>)</h3>
              <p className="text-xs text-slate-400">
                To guarantee the validation suite cannot be trivially bypassed, three synthetic corruptions were executed and verified:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-red-400 mb-1">Corruption A: Sample Rate</div>
                  <div className="text-xs text-slate-300">WAV header downsampled to 8,000 Hz.</div>
                  <div className="text-xs text-emerald-400 mt-2 font-mono font-semibold">✓ Caught: test_sample_rate FAILED</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-red-400 mb-1">Corruption B: Digital Clipping</div>
                  <div className="text-xs text-slate-300">Signal amplitude forced to 1.0 clipping.</div>
                  <div className="text-xs text-emerald-400 mt-2 font-mono font-semibold">✓ Caught: test_no_clipping FAILED</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-red-400 mb-1">Corruption C: Silent Audio</div>
                  <div className="text-xs text-slate-300">Audio buffer zeroed out completely.</div>
                  <div className="text-xs text-emerald-400 mt-2 font-mono font-semibold">✓ Caught: test_silence_ratio FAILED</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: LABELLING & AGREEMENT */}
        {activeTab === 'labelling' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
                <h2 className="text-lg font-bold text-white mb-2">Intent Confusion Matrices (120 Double Annotations)</h2>
                <p className="text-xs text-slate-400 mb-4">
                  Round 1 ($\kappa = 0.911$) had boundary ambiguities between IT support and student services. Round 2 ($\kappa = 1.000$) resolved all confusions.
                </p>
                <img src="figures/confusion_matrix.png" alt="Confusion Matrix" className="rounded-lg border border-slate-800 w-full" />
              </div>
              <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
                <h2 className="text-lg font-bold text-white mb-2">Helpdesk Intent Class Balance</h2>
                <p className="text-xs text-slate-400 mb-4">
                  Uniform distribution across admissions (25.3%), hostel_mess (24.9%), it_support (24.9%), and student_services (24.9%).
                </p>
                <img src="figures/class_balance.png" alt="Class Balance" className="rounded-lg border border-slate-800 w-full" />
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Top Disagreement Case Studies &amp; Resolution</h3>
              <div className="space-y-3">
                {sampleDisagreements.map((d, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-mono text-blue-400 font-bold">{d.clip_id}</span>
                      <span className="text-amber-400 font-semibold">Resolved in v2 Guidelines</span>
                    </div>
                    <div className="text-slate-300"><strong>Annotator A:</strong> {d.annotator_a}</div>
                    <div className="text-slate-300"><strong>Annotator B:</strong> {d.annotator_b}</div>
                    <div className="text-emerald-400 pt-1"><strong>Consensus Rule:</strong> {d.resolution}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: AUGMENTATION & ACTIVE LEARNING */}
        {activeTab === 'augmentation' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
                <h2 className="text-lg font-bold text-white mb-2">Active Learning vs. Random Selection Curve</h2>
                <p className="text-xs text-slate-400 mb-4">
                  Whisper decoder entropy acquisition achieves full 4-class coverage at $B = 10$, outperforming random selection by prioritizing rare administrative terms.
                </p>
                <img src="figures/active_learning_curve.png" alt="Active Learning Curve" className="rounded-lg border border-slate-800 w-full" />
              </div>

              <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h2 className="text-lg font-bold text-white mb-2">5 Stochastic Audio Augmentations</h2>
                <p className="text-xs text-slate-400">
                  Generated 25 augmented speech samples logged in <code className="text-blue-400">augmented_metadata.csv</code> with automatic label-preservation verification:
                </p>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside pt-1">
                  <li><strong>MUSAN Additive Noise:</strong> Random Gaussian room noise between 5\,dB and 15\,dB SNR.</li>
                  <li><strong>Room Impulse Response (RIR):</strong> Convolving dry speech with room acoustics to simulate academic lecture halls.</li>
                  <li><strong>Speed Perturbation (0.9x):</strong> Time-stretching audio to model deliberate, hesitant speech.</li>
                  <li><strong>Speed Perturbation (1.1x):</strong> Accelerated playback to simulate rapid conversational queries.</li>
                  <li><strong>Pitch Shifting:</strong> Fundamental frequency altered by $\pm 1.5$ semitones to simulate vocal tract diversity.</li>
                </ul>
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 mt-4">
                  ✓ Verified: All 25 augmented clips retain identical transcript and intent metadata (<code className="text-white">label_preserved=True</code>).
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 6: SPLITS & LEAKAGE */}
        {activeTab === 'splits' && (
          <section className="space-y-6">
            <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-2">Speaker-Disjoint Dataset Partitions</h2>
              <p className="text-xs text-slate-400 mb-4">
                Strict partition guarantees that no speaker's voice ever appears in both training and test distributions (SPLIT_SEED = 42).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-blue-400 uppercase">Train Set (70%)</div>
                  <div className="text-2xl font-black text-white mt-1">181 <span className="text-xs text-slate-400 font-normal">clips</span></div>
                  <div className="text-xs text-slate-400 mt-1">13 Speakers (P1, P2, P5, P7, P8, P9, etc.)</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-purple-400 uppercase">Validation Set (15%)</div>
                  <div className="text-2xl font-black text-white mt-1">41 <span className="text-xs text-slate-400 font-normal">clips</span></div>
                  <div className="text-xs text-slate-400 mt-1">2 Speakers (P11, P12)</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-emerald-400 uppercase">Test Set (15%)</div>
                  <div className="text-2xl font-black text-white mt-1">27 <span className="text-xs text-slate-400 font-normal">clips</span></div>
                  <div className="text-xs text-slate-400 mt-1">4 Speakers (P3, P6, P10, P14)</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-amber-800/80">
                  <div className="text-xs font-bold text-amber-400 uppercase">Cohort B Shifted</div>
                  <div className="text-2xl font-black text-white mt-1">32 <span className="text-xs text-slate-400 font-normal">clips</span></div>
                  <div className="text-xs text-amber-300 mt-1">2 Speakers (Maharashtra Region: P4, P13)</div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-semibold mt-4">
                ✓ Speaker Leakage Check: PASSED (Train ∩ Val = ∅, Train ∩ Test = ∅, Val ∩ Test = ∅).
              </div>
            </div>
          </section>
        )}

        {/* TAB 7: HANDOFF & REPRODUCIBILITY */}
        {activeTab === 'handoff' && (
          <section className="space-y-6">
            <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-2">Assignment 2 Handoff Checksums (Frozen at a1-final)</h2>
              <p className="text-xs text-slate-400 mb-4">
                Cryptographic fingerprints recorded in <code className="text-blue-400">HANDOFF_A2.md</code>. All downstream acoustic models must benchmark against these exact files:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300 font-mono">
                  <thead className="bg-slate-800/60 text-slate-200">
                    <tr>
                      <th className="p-2.5">Dataset File</th>
                      <th className="p-2.5">SHA-256 Checksum</th>
                      <th className="p-2.5">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[11px]">
                    <tr><td className="p-2 text-purple-400 font-bold">data/gold_test_set.csv</td><td className="p-2 text-slate-300">01dc4503853893b0ea309184c1c75620fa63dabfaf1710a32f2847dc68fa4582</td><td className="p-2 font-sans text-slate-400">Gold evaluation set — never tune on this</td></tr>
                    <tr><td className="p-2 text-blue-400 font-bold">data/splits/train.csv</td><td className="p-2 text-slate-300">2a8fc53692251a7eb060824c5a3a893dfc755b9d589a1cb711235e8b8b81ee57</td><td className="p-2 font-sans text-slate-400">Training set (speaker-disjoint)</td></tr>
                    <tr><td className="p-2 text-blue-400 font-bold">data/splits/val.csv</td><td className="p-2 text-slate-300">9b54f8e5727415f604621e1d8e2dd12e59a4f9cc037a1804be46c3abaa50821c</td><td className="p-2 font-sans text-slate-400">Validation set</td></tr>
                    <tr><td className="p-2 text-blue-400 font-bold">data/splits/test.csv</td><td className="p-2 text-slate-300">5c1f32307a8ff6dc550185180c431434c6d2ad7fda79fb00126e8ee9d61ab71d</td><td className="p-2 font-sans text-slate-400">In-distribution test set</td></tr>
                    <tr><td className="p-2 text-amber-400 font-bold">data/splits/cohort_b_shifted.csv</td><td className="p-2 text-slate-300">0d780ed6b5e4456590bdaa115f1815594d185b1e6372fb607c6afd78f285a47f</td><td className="p-2 font-sans text-slate-400">Regional drift evaluation (Maharashtra)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Quickstart Pipeline Rebuild (5 Commands)</h3>
              <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{`# 1. Install pinned dependencies
pip install -r requirements.txt

# 2. Ingest multi-format audio into canonical 16kHz mono WAV
python part_a_collection/ingest_records.py --records-dir Records

# 3. Execute 10-check validation suite
pytest part_b_validation/validation_suite.py -v

# 4. Compute inter-annotator agreement & freeze gold evaluation set
python part_c_labelling/compute_agreement.py

# 5. Generate speaker-disjoint splits & Cohort B shift set
python part_e_versioning/make_splits.py`}
              </pre>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-6 text-center text-xs text-slate-500">
        CS203 Software Tools and Techniques in AI • IIT Gandhinagar • Assignment 1 Submission (Project 5)
      </footer>
    </div>
  );
};

export default ReportDashboard;
