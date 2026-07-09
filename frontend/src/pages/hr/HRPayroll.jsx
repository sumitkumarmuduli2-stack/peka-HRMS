import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiDollarSign, FiPlus, FiEdit2, FiTrash2,
  FiSearch, FiDownload, FiCheckCircle, FiClock, FiFilter,
} from 'react-icons/fi';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const statusColor = { Draft: 'warning', Processed: 'info', Paid: 'success' };

const emptyForm = {
  employeeId: '',
  month: new Date().getMonth() + 1,
  year: CURRENT_YEAR,
  basicSalary: '',
  allowances: '',
  overtime: '',
  bonus: '',
  taxDeduction: '',
  providentFund: '',
  otherDeductions: '',
  paymentMethod: 'Bank Transfer',
  notes: '',
};

const HRPayroll = () => {
  const { showToast } = useAuth();
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(CURRENT_YEAR);
  const [filterStatus, setFilterStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [showPayslip, setShowPayslip] = useState(null); // payroll record for payslip modal

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      if (filterStatus) params.status = filterStatus;

      const [payrollRes, empRes] = await Promise.all([
        api.get('/payroll', { params }),
        api.get('/hr/employees'),
      ]);
      setRecords(payrollRes.data.data);
      setEmployees(empRes.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not load payroll data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear, filterStatus, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setModalMode('create');
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (rec) => {
    setModalMode('edit');
    setEditingId(rec._id);
    setForm({
      employeeId: rec.employee?._id || '',
      month: rec.month,
      year: rec.year,
      basicSalary: rec.basicSalary,
      allowances: rec.allowances,
      overtime: rec.overtime,
      bonus: rec.bonus,
      taxDeduction: rec.taxDeduction,
      providentFund: rec.providentFund,
      otherDeductions: rec.otherDeductions,
      paymentMethod: rec.paymentMethod,
      notes: rec.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.basicSalary) {
      showToast('Employee and Basic Salary are required', 'error');
      return;
    }
    setSubmitLoading(true);
    try {
      if (modalMode === 'create') {
        await api.post('/payroll', form);
        showToast('Payroll record created!', 'success');
      } else {
        await api.put(`/payroll/${editingId}`, form);
        showToast('Payroll record updated!', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll record?')) return;
    try {
      await api.delete(`/payroll/${id}`);
      showToast('Deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Deletion failed', 'error');
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Mark this payroll as Paid? This cannot be undone.')) return;
    try {
      await api.put(`/payroll/${id}/mark-paid`);
      showToast('Payroll marked as Paid!', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Employee','Month','Year','Basic','Allowances','Overtime','Bonus','Tax','PF','Other','Gross','Deductions','Net','Status'];
    const rows = records.map(r => [
      r.employee?.user?.name || '',
      MONTHS[r.month - 1],
      r.year,
      r.basicSalary, r.allowances, r.overtime, r.bonus,
      r.taxDeduction, r.providentFund, r.otherDeductions,
      r.grossPay, r.totalDeductions, r.netPay, r.status,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.setAttribute('href', encodeURI(csv));
    a.setAttribute('download', `peka_payroll_${filterYear}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const gross = Number(form.basicSalary||0) + Number(form.allowances||0) + Number(form.overtime||0) + Number(form.bonus||0);
  const deductions = Number(form.taxDeduction||0) + Number(form.providentFund||0) + Number(form.otherDeductions||0);
  const net = gross - deductions;

  const filtered = records.filter(r => {
    const text = `${r.employee?.user?.name} ${r.employee?.user?.email} ${r.employee?.employeeId}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const totalNetPaid = records.filter(r => r.status === 'Paid').reduce((s, r) => s + r.netPay, 0);
  const totalPending = records.filter(r => r.status !== 'Paid').length;

  if (loading) return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ height: '40px', width: '220px' }} className="skeleton" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
        {[1,2,3].map(i => <div key={i} style={{ height: '100px' }} className="skeleton" />)}
      </div>
      <div style={{ height: '400px' }} className="skeleton" />
    </div>
  );

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Payroll Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Generate, process, and manage employee salary payslips.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary"><FiDownload /> Export CSV</button>
          <button onClick={openCreate} className="btn btn-primary"><FiPlus /> Generate Payroll</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Records', value: records.length, icon: <FiDollarSign />, color: 'var(--primary-color)' },
          { label: 'Total Net Paid', value: `₹${totalNetPaid.toLocaleString()}`, icon: <FiCheckCircle />, color: 'var(--success-color)' },
          { label: 'Pending Payments', value: totalPending, icon: <FiClock />, color: 'var(--warning-color)' },
        ].map(s => (
          <div key={s.label} className="card stat-card-accent" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '1.3rem', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '16px 20px', alignItems: 'center' }}>
        <FiSearch color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search employee..."
          style={{ flex: 1, minWidth: '180px', border: 'none', outline: 'none', fontSize: '0.9rem' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <FiFilter color="var(--text-muted)" />
        <select className="input-field" style={{ width: 'auto', padding: '8px 36px 8px 12px' }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="">All Months</option>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select className="input-field" style={{ width: 'auto', padding: '8px 36px 8px 12px' }} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="input-field" style={{ width: 'auto', padding: '8px 36px 8px 12px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Processed">Processed</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Payroll Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length > 0 ? (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="peka-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Basic Salary</th>
                  <th>Gross Pay</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rec => (
                  <tr key={rec._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rec.employee?.user?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rec.employee?.employeeId}</div>
                    </td>
                    <td>{MONTHS[rec.month - 1]} {rec.year}</td>
                    <td>₹{rec.basicSalary.toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>₹{rec.grossPay.toLocaleString()}</td>
                    <td style={{ color: 'var(--danger-color)' }}>- ₹{rec.totalDeductions.toLocaleString()}</td>
                    <td style={{ fontWeight: 800, color: 'var(--success-color)', fontSize: '1rem' }}>₹{rec.netPay.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${statusColor[rec.status]}`}>{rec.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => setShowPayslip(rec)} className="btn btn-text" style={{ padding: '4px', color: 'var(--info-color)', fontSize: '0.75rem', fontWeight: 600 }}>
                          Slip
                        </button>
                        {rec.status !== 'Paid' && (
                          <>
                            <button onClick={() => openEdit(rec)} className="btn btn-text" style={{ padding: '4px', color: 'var(--primary-color)' }}>
                              <FiEdit2 size={14} />
                            </button>
                            <button onClick={() => handleMarkPaid(rec._id)} className="btn btn-text" style={{ padding: '4px', color: 'var(--success-color)' }}>
                              <FiCheckCircle size={14} />
                            </button>
                            <button onClick={() => handleDelete(rec._id)} className="btn btn-text" style={{ padding: '4px', color: 'var(--danger-color)' }}>
                              <FiTrash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FiDollarSign size={44} />
            <p>No payroll records found.<br />Click "Generate Payroll" to create the first entry.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-card card" style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-family-display)' }}>
              {modalMode === 'create' ? 'Generate Payroll' : 'Edit Payroll'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '6px' }}>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Employee *</label>
                  <select className="input-field" required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} disabled={modalMode === 'edit'}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.user?.name} ({emp.employeeId})</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Month *</label>
                  <select className="input-field" value={form.month} onChange={e => setForm({ ...form, month: Number(e.target.value) })} disabled={modalMode === 'edit'}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Year *</label>
                  <select className="input-field" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} disabled={modalMode === 'edit'}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Payment Method</label>
                  <select className="input-field" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>Cash</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px' }}>
                <div style={{ background: 'rgba(37,20,90,0.03)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earnings</div>
                  {[['basicSalary','Basic Salary *'],['allowances','Allowances'],['overtime','Overtime'],['bonus','Bonus']].map(([key, label]) => (
                    <div className="input-group" key={key} style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.8rem' }}>{label}</label>
                      <input type="number" min="0" className="input-field" style={{ padding: '8px 12px' }} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder="0" />
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(239,68,68,0.04)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger-color)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deductions</div>
                  {[['taxDeduction','Tax / TDS'],['providentFund','Provident Fund'],['otherDeductions','Other']].map(([key, label]) => (
                    <div className="input-group" key={key} style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.8rem' }}>{label}</label>
                      <input type="number" min="0" className="input-field" style={{ padding: '8px 12px' }} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder="0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Live preview */}
              <div style={{ background: 'var(--background-color)', borderRadius: '10px', padding: '14px 20px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gross: <strong style={{ color: 'var(--text-primary)' }}>₹{gross.toLocaleString()}</strong></span>
                <span style={{ color: 'var(--text-muted)' }}>Deductions: <strong style={{ color: 'var(--danger-color)' }}>- ₹{deductions.toLocaleString()}</strong></span>
                <span style={{ color: 'var(--text-muted)' }}>Net Pay: <strong style={{ color: 'var(--success-color)', fontSize: '1.05rem' }}>₹{net.toLocaleString()}</strong></span>
              </div>

              <div className="input-group" style={{ marginTop: '14px' }}>
                <label>Notes</label>
                <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" disabled={submitLoading} className="btn btn-primary">
                  {submitLoading ? 'Saving...' : modalMode === 'create' ? 'Generate' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Preview Modal */}
      {showPayslip && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-card card" style={{ width: '100%', maxWidth: '520px', boxShadow: 'var(--shadow-xl)' }} id="payslip-print-area">
            {/* Payslip Header */}
            <div style={{ background: 'var(--gradient-primary)', color: '#fff', borderRadius: '10px', padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.4rem', fontWeight: 800 }}>PEKA HRMS</div>
              <div style={{ opacity: 0.8, fontSize: '0.85rem', marginTop: '4px' }}>Payslip — {MONTHS[showPayslip.month - 1]} {showPayslip.year}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Employee:</span> <strong>{showPayslip.employee?.user?.name}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>ID:</span> <strong>{showPayslip.employee?.employeeId}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Designation:</span> <strong>{showPayslip.employee?.jobTitle || '—'}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Payment:</span> <strong>{showPayslip.paymentMethod}</strong></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', fontSize: '0.85rem', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(37,20,90,0.03)', padding: '14px' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary-color)', marginBottom: '10px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Earnings</div>
                {[['Basic Salary', showPayslip.basicSalary],['Allowances', showPayslip.allowances],['Overtime', showPayslip.overtime],['Bonus', showPayslip.bonus]].map(([l,v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <strong>₹{Number(v).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(239,68,68,0.03)', padding: '14px', borderLeft: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, color: 'var(--danger-color)', marginBottom: '10px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Deductions</div>
                {[['Tax / TDS', showPayslip.taxDeduction],['Provident Fund', showPayslip.providentFund],['Others', showPayslip.otherDeductions]].map(([l,v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <strong style={{ color: 'var(--danger-color)' }}>- ₹{Number(v).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--gradient-primary)', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <span style={{ fontWeight: 600 }}>Net Pay</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-family-display)' }}>₹{showPayslip.netPay.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowPayslip(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}><FiDownload /> Print / Save PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPayroll;
