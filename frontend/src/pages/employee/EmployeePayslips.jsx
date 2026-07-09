import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiDollarSign, FiDownload, FiFileText, FiTrendingUp } from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];
const MONTHS_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const EmployeePayslips = () => {
  const { showToast } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        setLoading(true);
        const res = await api.get('/payroll/my');
        setPayslips(res.data.data);
      } catch (err) {
        console.error(err);
        showToast('Could not load payslip data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, [showToast]);

  const chartData = [...payslips]
    .slice(0, 6)
    .reverse()
    .map(p => ({
      month: `${MONTHS[p.month - 1]} ${p.year}`,
      gross: p.grossPay,
      net: p.netPay,
      deductions: p.totalDeductions,
    }));

  const totalEarned = payslips.reduce((s, p) => s + p.netPay, 0);
  const latestSlip = payslips[0];

  if (loading) return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ height: '40px', width: '220px' }} className="skeleton" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
        {[1,2,3].map(i => <div key={i} style={{ height: '90px' }} className="skeleton" />)}
      </div>
      <div style={{ height: '280px' }} className="skeleton" />
    </div>
  );

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>My Payslips</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          View and download your monthly salary statements.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Payslips', value: payslips.length, icon: <FiFileText />, color: 'var(--primary-color)' },
          { label: 'Total Earned (Net)', value: `₹${totalEarned.toLocaleString()}`, icon: <FiTrendingUp />, color: 'var(--success-color)' },
          { label: 'Latest Net Pay', value: latestSlip ? `₹${latestSlip.netPay.toLocaleString()}` : '—', icon: <FiDollarSign />, color: 'var(--info-color)' },
        ].map(s => (
          <div key={s.label} className="card stat-card-accent" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '1.3rem', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Earnings Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiTrendingUp style={{ color: 'var(--primary-color)' }} />
            Earnings History
          </h4>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="month" fontSize={11} stroke="var(--text-muted)" />
                <YAxis fontSize={11} stroke="var(--text-muted)" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v, n) => [`₹${Number(v).toLocaleString()}`, n === 'net' ? 'Net Pay' : n === 'gross' ? 'Gross' : 'Deductions']} />
                <Bar dataKey="gross" fill="rgba(37,20,90,0.12)" radius={[6,6,0,0]} name="gross" />
                <Bar dataKey="net" fill="var(--primary-color)" radius={[6,6,0,0]} name="net" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Payslips List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiFileText style={{ color: 'var(--primary-color)' }} />
            All Payslips
          </h4>
        </div>

        {payslips.length > 0 ? (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, marginTop: '16px' }}>
            <table className="peka-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Basic Salary</th>
                  <th>Gross Pay</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Payment Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{MONTHS_FULL[p.month - 1]} {p.year}</td>
                    <td>₹{p.basicSalary.toLocaleString()}</td>
                    <td>₹{p.grossPay.toLocaleString()}</td>
                    <td style={{ color: 'var(--danger-color)' }}>- ₹{p.totalDeductions.toLocaleString()}</td>
                    <td style={{ fontWeight: 800, color: 'var(--success-color)', fontSize: '1rem' }}>₹{p.netPay.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelected(p)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
                      >
                        <FiDownload size={13} /> View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FiDollarSign size={44} />
            <p>No payslips available yet.<br />Your salary slips will appear here once HR processes your payroll.</p>
          </div>
        )}
      </div>

      {/* Payslip Modal */}
      {selected && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-card card" style={{ width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)' }}>
            {/* Header */}
            <div style={{ background: 'var(--gradient-primary)', color: '#fff', borderRadius: '10px', padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.4rem', fontWeight: 800 }}>PEKA HRMS</div>
              <div style={{ opacity: 0.8, fontSize: '0.85rem', marginTop: '4px' }}>
                Payslip — {MONTHS_FULL[selected.month - 1]} {selected.year}
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', fontSize: '0.85rem', marginBottom: '16px' }}>
              <div style={{ padding: '14px', background: 'rgba(37,20,90,0.03)' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary-color)', marginBottom: '10px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Earnings</div>
                {[['Basic Salary', selected.basicSalary],['Allowances', selected.allowances],['Overtime', selected.overtime],['Bonus', selected.bonus]].map(([l,v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <strong>₹{Number(v).toLocaleString()}</strong>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Gross Pay</strong>
                  <strong>₹{selected.grossPay.toLocaleString()}</strong>
                </div>
              </div>
              <div style={{ padding: '14px', background: 'rgba(239,68,68,0.03)', borderLeft: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, color: 'var(--danger-color)', marginBottom: '10px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Deductions</div>
                {[['Tax / TDS', selected.taxDeduction],['Provident Fund', selected.providentFund],['Others', selected.otherDeductions]].map(([l,v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <strong style={{ color: 'var(--danger-color)' }}>- ₹{Number(v).toLocaleString()}</strong>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Total</strong>
                  <strong style={{ color: 'var(--danger-color)' }}>- ₹{selected.totalDeductions.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--gradient-primary)', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <span style={{ fontWeight: 600 }}>Net Pay</span>
              <span style={{ fontSize: '1.7rem', fontWeight: 900, fontFamily: 'var(--font-family-display)' }}>₹{selected.netPay.toLocaleString()}</span>
            </div>

            {selected.notes && (
              <div style={{ marginTop: '14px', padding: '12px', background: 'var(--background-color)', borderRadius: '8px', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                <strong>Note:</strong> {selected.notes}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <FiDownload /> Print / PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayslips;
