import { useEffect } from 'react'
import { Button, Divider, Form, Input, Modal, Radio, Space, Typography, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { FranchisePartnerDetail, QualificationSnapshot } from '@/mock/franchisePartners'
import {
  beforeReviewUpload,
  formValuesToQualificationSnapshot,
  normUpload,
  qualificationSnapshotToFormValues,
  type QualificationFormValues,
} from '@/utils/franchiseQualificationUpload'

type Props = {
  open: boolean
  partner: FranchisePartnerDetail | null
  /** 编辑起点：默认生效快照；有待审时可改为待审快照 */
  initialSnapshot?: QualificationSnapshot | null
  onClose: () => void
  onSaved: (snapshot: QualificationSnapshot) => void | Promise<void>
}

export default function FranchiseQualificationEditModal({
  open,
  partner,
  initialSnapshot,
  onClose,
  onSaved,
}: Props) {
  const [form] = Form.useForm<QualificationFormValues>()

  useEffect(() => {
    if (!open || !partner) return
    const base =
      initialSnapshot ||
      (Object.keys(partner.qualification.approvedSnapshot || {}).length > 0
        ? partner.qualification.approvedSnapshot
        : partner.qualification.pendingReview?.snapshot) ||
      {}
    form.setFieldsValue(qualificationSnapshotToFormValues(base))
  }, [open, partner, initialSnapshot, form])

  const handleOk = async () => {
    if (!partner) return
    try {
      const v = await form.validateFields()
      const snap = await formValuesToQualificationSnapshot(v)
      if (!snap.orgName) {
        message.warning('请填写机构名称')
        return
      }
      if (!snap.businessLicenseAttachment?.dataUrl) {
        message.warning('请上传营业执照电子版')
        return
      }
      if (!snap.venueFrontPhotoAttachment?.dataUrl || !snap.venueClassroomPhotoAttachment?.dataUrl) {
        message.warning('请上传门头照片与教室照片')
        return
      }
      await onSaved(snap)
    } catch {
      /* 校验未通过 */
    }
  }

  return (
    <Modal
      title={partner ? `编辑机构资质 · ${partner.orgName}` : '编辑机构资质'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      width={760}
      destroyOnClose
      okText="保存并生效"
      cancelText="取消"
    >
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12, fontSize: 13 }}>
        总部直接维护资质，<strong>无需走审核流程</strong>；保存后立即写入「已通过」快照并同步加盟商/机构端（同源
        localStorage 演示环境）。
      </Typography.Paragraph>
      <Form form={form} layout="vertical">
        <Form.Item name="orgName" label="机构名称" rules={[{ required: true, message: '必填' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="legalRepresentative" label="法定代表人" rules={[{ required: true, message: '必填' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="机构地址" rules={[{ required: true, message: '必填' }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item
          name="contactPhone"
          label="联系人电话"
          rules={[
            { required: true, message: '必填' },
            { pattern: /^1\d{10}$/, message: '请输入 11 位手机号' },
          ]}
        >
          <Input maxLength={11} />
        </Form.Item>
        <Form.Item name="businessLicenseNumber" label="营业执照注册号 / 统一社会信用代码" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="businessLicenseFiles" label="营业执照电子版" valuePropName="fileList" getValueFromEvent={normUpload} rules={[{ required: true, message: '请上传' }]}>
          <Upload beforeUpload={beforeReviewUpload} maxCount={1} accept="application/pdf,image/*">
            <Button icon={<UploadOutlined />}>上传营业执照</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="businessLicenseCopy" label="营业执照复印件说明（选填）">
          <Input />
        </Form.Item>
        <Form.Item name="businessScope" label="经营范围" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Divider orientation="left" plain>
          负责人信息
        </Divider>
        <Form.Item name="principalName" label="负责人姓名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="principalPhone"
          label="负责人电话"
          rules={[
            { required: true },
            { pattern: /^1\d{10}$/, message: '请输入 11 位手机号' },
          ]}
        >
          <Input maxLength={11} />
        </Form.Item>
        <Form.Item name="principalIdNumber" label="负责人身份证号" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Divider orientation="left" plain>
          场地与经营情况
        </Divider>
        <Form.Item name="venueFrontPhotoFiles" label="场地门头照片" valuePropName="fileList" getValueFromEvent={normUpload} rules={[{ required: true }]}>
          <Upload beforeUpload={beforeReviewUpload} maxCount={1} accept="image/*" listType="picture">
            <Button icon={<UploadOutlined />}>上传门头照片</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="venueClassroomPhotoFiles" label="教室照片" valuePropName="fileList" getValueFromEvent={normUpload} rules={[{ required: true }]}>
          <Upload beforeUpload={beforeReviewUpload} maxCount={1} accept="image/*" listType="picture">
            <Button icon={<UploadOutlined />}>上传教室照片</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="isAiTechTrack" label="是否属于 AI / 科技赛道" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio.Button value="yes">是</Radio.Button>
            <Radio.Button value="no">否</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="existingProjects" label="已开办项目" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Space.Compact style={{ width: '100%', gap: 12 }}>
          <Form.Item name="studentCount" label="现有生源数量" style={{ flex: 1 }} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="studentAgeRange" label="现有生源年龄段" style={{ flex: 1 }} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Space.Compact>
        <Form.Item name="hasDedicatedClassroom" label="是否设立加盟专用教室" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio.Button value="yes">是</Radio.Button>
            <Radio.Button value="no">否</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="schoolPermitFiles" label="办学许可证（非必录）" valuePropName="fileList" getValueFromEvent={normUpload}>
          <Upload beforeUpload={beforeReviewUpload} maxCount={1} accept="application/pdf,image/*">
            <Button icon={<UploadOutlined />}>上传办学许可证</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  )
}
