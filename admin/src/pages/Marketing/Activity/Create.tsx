import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, Select, DatePicker, Collapse, Button, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import type { MarketingActivity, ActivityType } from '@/api/marketing'
import { ACTIVITY_TYPE_MAP } from '@/api/marketing'
import dayjs from 'dayjs'

const { TextArea } = Input

const typeOptions = Object.entries(ACTIVITY_TYPE_MAP).map(([value, label]) => ({ label, value }))

export default function MarketingActivityCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [form] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    if (!id) {
      form.resetFields()
      return
    }
    // 对接 getActivityDetail(id) 填充表单
    const mock: Partial<MarketingActivity> = {
      id: String(id),
      name: '新人优惠券活动',
      type: 'coupon',
      startTime: '2024-02-01 00:00:00',
      endTime: '2024-02-28 23:59:59',
    }
    form.setFieldsValue({
      name: mock.name,
      type: mock.type,
      startTime: mock.startTime ? dayjs(mock.startTime) : undefined,
      endTime: mock.endTime ? dayjs(mock.endTime) : undefined,
      ruleConfig: '',
      prizeConfig: '',
      publishConfig: '',
    })
  }, [id, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitLoading(true)
      await new Promise((r) => setTimeout(r, 500))
      message.success(id ? '保存成功' : '创建成功')
      navigate('/marketing/activity')
    } catch {
      //
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/marketing/activity')}>返回活动列表</Button>
      </div>
      <h2 style={{ marginBottom: 24 }}>{id ? '编辑活动' : '创建活动'}</h2>
      <Card>
        <Form form={form} layout="vertical" style={{ maxWidth: 680 }}>
          <Collapse
            defaultActiveKey={['basic', 'rule', 'prize', 'publish']}
            items={[
              {
                key: 'basic',
                label: '基础信息',
                children: (
                  <>
                    <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
                      <Input placeholder="请输入活动名称" />
                    </Form.Item>
                    <Form.Item name="type" label="活动类型" rules={[{ required: true }]}>
                      <Select placeholder="选择活动类型" options={typeOptions} />
                    </Form.Item>
                    <Form.Item name="startTime" label="开始时间" rules={[{ required: true }]}>
                      <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
                    </Form.Item>
                    <Form.Item name="endTime" label="结束时间" rules={[{ required: true }]}>
                      <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'rule',
                label: '规则配置',
                children: (
                  <Form.Item name="ruleConfig" label="活动规则">
                    <TextArea rows={4} placeholder="配置活动规则，如满减条件、拼团人数等" />
                  </Form.Item>
                ),
              },
              {
                key: 'prize',
                label: '奖品/优惠券配置',
                children: (
                  <Form.Item name="prizeConfig" label="奖品配置">
                    <TextArea rows={4} placeholder="配置奖品、优惠券、课程礼包等" />
                  </Form.Item>
                ),
              },
              {
                key: 'publish',
                label: '发布设置',
                children: (
                  <Form.Item name="publishConfig" label="发布说明">
                    <TextArea rows={2} placeholder="发布前说明或备注" />
                  </Form.Item>
                ),
              },
            ]}
          />
          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" onClick={handleSubmit} loading={submitLoading}>保存</Button>
            <Button style={{ marginLeft: 12 }} onClick={() => navigate('/marketing/activity')}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
