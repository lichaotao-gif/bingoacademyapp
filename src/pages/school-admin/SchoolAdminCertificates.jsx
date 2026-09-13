import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  CERT_REQUEST_STATUS,
  CERT_SOURCE,
  fmtDateTime,
  listCertRequestsForSession,
  listCertificates,
  listClassStudents,
  listClasses,
  submitCertRequest,
} from '../../utils/schoolAdminStorage'
import useSchoolDbRefresh from './useSchoolDbRefresh'
import { DataTable, Field, FormError, GhostButton, Modal, Pill, PrimaryButton, SectionCard, inputCls } from './SchoolUiKit'

const REQUEST_LABELS = {
  [CERT_REQUEST_STATUS.PENDING]: '审核中',
  [CERT_REQUEST_STATUS.APPROVED]: '已通过',
  [CERT_REQUEST_STATUS.REJECTED]: '已驳回',
}

const REQUEST_TONES = {
  [CERT_REQUEST_STATUS.PENDING]: 'amber',
  [CERT_REQUEST_STATUS.APPROVED]: 'green',
  [CERT_REQUEST_STATUS.REJECTED]: 'rose',
}

function SubmitModal({ cls, students, onClose, onSubmit }) {
  const [confirmText, setConfirmText] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const r = onSubmit(confirmText)
    if (!r.ok) {
      setErr(r.msg || '提交失败')
      return
    }
    onClose()
  }

  const zeroCount = students.filter((s) => (s.realProgress || 0) === 0).length

  return (
    <Modal
      title={`提交结课发证申请：${cls.name}`}
      desc="平台运营审核通过后统一签发证书，通过即视为考核合格且不可撤销。提交本身不会改动学生数据。"
      onClose={onClose}
      width="max-w-xl"
    >
      <form onSubmit={submit} className="space-y-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
          本次为整班操作，共 <b>{students.length}</b> 名学生
          {zeroCount ? (
            <>
              ，其中 <b>{zeroCount}</b> 名尚无学习记录（0%），审核通过后同样发证，完成时间取平台审核通过时间。
            </>
          ) : (
            '。'
          )}
          <br />
          审核通过后该班学生展示进度将统一置为 100%，真实学习进度会保留用于统计与审计。
        </div>
        <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-2 py-1.5 text-left font-medium">学生</th>
                <th className="px-2 py-1.5 text-left font-medium">真实进度</th>
                <th className="px-2 py-1.5 text-left font-medium">最后学习时间</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-2 py-1.5">{s.name}</td>
                  <td className="px-2 py-1.5">{s.realProgress}%</td>
                  <td className="px-2 py-1.5">{s.lastStudyAt ? fmtDateTime(s.lastStudyAt) : '无学习记录'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Field label="请输入班级名称以确认" hint={`需与班级名称完全一致：${cls.name}`}>
          <input className={inputCls} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        </Field>
        <FormError message={err} />
        <div className="flex justify-end gap-2 pt-1">
          <GhostButton type="button" onClick={onClose}>
            取消
          </GhostButton>
          <PrimaryButton type="submit">提交平台审核</PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}

function RequestDetailModal({ request, onClose }) {
  return (
    <Modal
      title={`申请明细：${request.className}`}
      desc={`提交人 ${request.applicantName} · ${fmtDateTime(request.submittedAt)}`}
      onClose={onClose}
      width="max-w-xl"
    >
      <div className="space-y-3">
        <p className="text-xs leading-5 text-slate-500">
          以下为提交时的进度快照，共 {request.studentCount} 名学生。
          {request.status === CERT_REQUEST_STATUS.REJECTED && request.rejectReason ? (
            <span className="mt-1 block text-rose-600">驳回原因：{request.rejectReason}</span>
          ) : null}
        </p>
        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-2 py-1.5 text-left font-medium">学生</th>
                <th className="px-2 py-1.5 text-left font-medium">手机号</th>
                <th className="px-2 py-1.5 text-left font-medium">提交时真实进度</th>
                <th className="px-2 py-1.5 text-left font-medium">最后学习时间</th>
              </tr>
            </thead>
            <tbody>
              {request.students.map((s) => (
                <tr key={s.studentId} className="border-t border-slate-100">
                  <td className="px-2 py-1.5">{s.studentName}</td>
                  <td className="px-2 py-1.5">{s.studentPhone}</td>
                  <td className="px-2 py-1.5">{s.realProgress}%</td>
                  <td className="px-2 py-1.5">{s.lastStudyAt ? fmtDateTime(s.lastStudyAt) : '无学习记录'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <PrimaryButton type="button" onClick={onClose}>
            关闭
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  )
}

export default function SchoolAdminCertificates() {
  const { session } = useOutletContext()
  useSchoolDbRefresh()
  const [submitFor, setSubmitFor] = useState(null)
  const [detailFor, setDetailFor] = useState(null)

  const classes = listClasses(session)
  const requests = listCertRequestsForSession(session)
  const visibleClassIds = new Set(classes.map((c) => c.id))
  const certificates = listCertificates({ schoolId: session.schoolId }).filter((c) => visibleClassIds.has(c.classId))

  const classColumns = [
    {
      key: 'name',
      title: '班级',
      render: (r) => (
        <div>
          <Link to={`/school/classes/${r.id}`} className="font-medium text-primary hover:underline">
            {r.name}
          </Link>
          <p className="mt-0.5 text-xs text-slate-400">
            {r.code} · {r.courseName}
          </p>
        </div>
      ),
    },
    { key: 'teacherName', title: '主讲老师' },
    { key: 'studentCount', title: '学生', render: (r) => `${r.studentCount} 人` },
    { key: 'status', title: '班级状态', render: (r) => <Pill tone="gray">{r.status}</Pill> },
    {
      key: 'certRequestStatus',
      title: '发证状态',
      render: (r) =>
        r.certRequestStatus ? (
          <div>
            <Pill tone={REQUEST_TONES[r.certRequestStatus]}>{REQUEST_LABELS[r.certRequestStatus]}</Pill>
            {r.certRequestRejectReason ? (
              <p className="mt-0.5 text-[11px] leading-4 text-rose-600">{r.certRequestRejectReason}</p>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-slate-400">未提交</span>
        ),
    },
    {
      key: 'ops',
      title: '操作',
      render: (r) =>
        r.hasPendingCertRequest ? (
          <span className="text-xs text-slate-400">审核中，不可重复提交</span>
        ) : r.studentCount === 0 ? (
          <span className="text-xs text-slate-400">暂无学生</span>
        ) : (
          <button
            type="button"
            onClick={() => setSubmitFor(r)}
            className="text-xs text-primary hover:underline"
          >
            {r.certRequestStatus === CERT_REQUEST_STATUS.REJECTED
              ? '重新提交'
              : r.certRequestStatus === CERT_REQUEST_STATUS.APPROVED
                ? '补发申请'
                : '提交发证申请'}
          </button>
        ),
    },
  ]

  const requestColumns = [
    {
      key: 'className',
      title: '班级',
      render: (r) => (
        <div>
          <span className="font-medium text-slate-900">{r.className}</span>
          <p className="mt-0.5 text-xs text-slate-400">{r.courseName}</p>
        </div>
      ),
    },
    { key: 'studentCount', title: '学生', render: (r) => `${r.studentCount} 人` },
    {
      key: 'status',
      title: '审核状态',
      render: (r) => (
        <div>
          <Pill tone={REQUEST_TONES[r.status]}>{REQUEST_LABELS[r.status]}</Pill>
          {r.status === CERT_REQUEST_STATUS.REJECTED && r.rejectReason ? (
            <p className="mt-0.5 text-[11px] leading-4 text-rose-600">{r.rejectReason}</p>
          ) : null}
        </div>
      ),
    },
    { key: 'applicantName', title: '提交人' },
    { key: 'submittedAt', title: '提交时间', render: (r) => fmtDateTime(r.submittedAt) },
    {
      key: 'reviewedAt',
      title: '审核时间',
      render: (r) =>
        r.reviewedAt ? (
          <div>
            {fmtDateTime(r.reviewedAt)}
            <p className="mt-0.5 text-[11px] text-slate-400">{r.reviewer}</p>
          </div>
        ) : (
          <span className="text-slate-400">待平台处理</span>
        ),
    },
    {
      key: 'ops',
      title: '操作',
      render: (r) => (
        <button type="button" onClick={() => setDetailFor(r)} className="text-xs text-primary hover:underline">
          查看名单
        </button>
      ),
    },
  ]

  const certColumns = [
    {
      key: 'studentName',
      title: '学生',
      render: (r) => (
        <Link to={`/school/students/${r.studentId}`} className="font-medium text-primary hover:underline">
          {r.studentName}
        </Link>
      ),
    },
    { key: 'className', title: '班级' },
    { key: 'courseName', title: '课程' },
    {
      key: 'source',
      title: '发证方式',
      render: (r) => (
        <Pill tone={r.source === CERT_SOURCE.MANUAL ? 'violet' : 'green'}>
          {r.source === CERT_SOURCE.MANUAL ? '手动发证（平台审核）' : '自动发证'}
        </Pill>
      ),
    },
    { key: 'completedAt', title: '完成时间', render: (r) => fmtDateTime(r.completedAt) },
    { key: 'issuedAt', title: '发证时间', render: (r) => fmtDateTime(r.issuedAt) },
    { key: 'progressSnapshot', title: '发证时实际进度', render: (r) => `${r.progressSnapshot}%` },
  ]

  return (
    <div className="space-y-4">
      <SectionCard
        title="可提交结课发证的班级"
        desc="整班提交，平台运营审核通过后统一签发证书；审核中的班级不可重复提交，被驳回后可修改情况再提交。"
      >
        <DataTable columns={classColumns} rows={classes} empty="暂无可提交的班级" />
      </SectionCard>

      <SectionCard title={`发证申请记录（${requests.length}）`} desc="记录每次提交的学生进度快照，便于审计追溯。">
        <DataTable columns={requestColumns} rows={requests} empty="暂无发证申请" />
      </SectionCard>

      <SectionCard title={`已发放证书（${certificates.length}）`} desc="含学生自行学完的自动发证与平台审核通过的手动发证。">
        <DataTable columns={certColumns} rows={certificates} empty="暂无证书" />
      </SectionCard>

      {submitFor ? (
        <SubmitModal
          cls={submitFor}
          students={listClassStudents(session, submitFor.id)}
          onClose={() => setSubmitFor(null)}
          onSubmit={(confirmText) => submitCertRequest(session, submitFor.id, confirmText)}
        />
      ) : null}

      {detailFor ? <RequestDetailModal request={detailFor} onClose={() => setDetailFor(null)} /> : null}
    </div>
  )
}
