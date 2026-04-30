import React, { useMemo, useState } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Form, Image, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Tag, Typography, Upload, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { HolderOutlined, PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import {
  FRANCHISE_TEACHING_CATALOG_LS_KEY,
  type TeachingProduct,
  deleteTeachingProduct,
  listTeachingProductsAdmin,
  reorderTeachingProducts,
  resetTeachingProductsToSeed,
  upsertTeachingProduct,
} from '@/mock/franchiseTeachingCatalog'

const COVER_UPLOAD_MAX_BYTES = 1024 * 1024

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string
}

const SortableRow: React.FC<SortableRowProps> = (props) => {
  const { children, ...rest } = props
  const rowKey = rest['data-row-key']
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: rowKey,
  })
  const style: React.CSSProperties = {
    ...rest.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999, background: '#fafafa' } : {}),
  }

  return (
    <tr {...rest} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        const colKey = (child.props as { column?: { key?: React.Key } }).column?.key
        if (colKey === 'sort') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <span
                ref={setActivatorNodeRef}
                style={{ cursor: 'grab', touchAction: 'none', display: 'inline-flex', alignItems: 'center' }}
                {...listeners}
                aria-label="拖拽排序"
              >
                <HolderOutlined style={{ color: '#999' }} />
              </span>
            ),
          })
        }
        return child
      })}
    </tr>
  )
}

export default function FranchiseTeachingProducts() {
  const [tick, setTick] = useState(0)
  const data = useMemo(() => {
    void tick
    return listTeachingProductsAdmin()
  }, [tick])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm<TeachingProduct & { id: string }>()
  const coverImageUrlWatch = Form.useWatch('coverImageUrl', form)

  const coverUploadFileList: UploadFile[] = useMemo(() => {
    const u = typeof coverImageUrlWatch === 'string' ? coverImageUrlWatch.trim() : ''
    if (!u.startsWith('data:image')) return []
    return [{ uid: '-cover', name: '封面图', status: 'done', url: u, thumbUrl: u }]
  }, [coverImageUrlWatch])

  const refresh = () => setTick((t) => t + 1)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = data.findIndex((x) => x.id === active.id)
    const newIndex = data.findIndex((x) => x.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(data, oldIndex, newIndex)
    reorderTeachingProducts(next.map((x) => x.id))
    refresh()
    message.success('排序已保存')
  }

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      id: '',
      name: '',
      price: 0,
      desc: '',
      coverImageUrl: '',
      coverGradientFrom: '#6366f1',
      coverGradientTo: '#22d3ee',
      coverDot: '#ffffff',
      enabled: true,
    })
    setOpen(true)
  }

  const openEdit = (row: TeachingProduct) => {
    setEditingId(row.id)
    form.setFieldsValue({
      ...row,
      coverImageUrl: row.coverImageUrl ?? '',
      coverGradientFrom: row.coverGradientFrom ?? '',
      coverGradientTo: row.coverGradientTo ?? '',
      coverDot: row.coverDot ?? '',
    })
    setOpen(true)
  }

  const beforeCoverUpload: UploadProps['beforeUpload'] = (file) => {
    const okType = file.type.startsWith('image/')
    if (!okType) {
      message.error('请上传图片文件')
      return Upload.LIST_IGNORE
    }
    if (file.size > COVER_UPLOAD_MAX_BYTES) {
      message.error('图片大小不能超过 1MB（演示环境 Base64 入库）')
      return Upload.LIST_IGNORE
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      if (url) {
        form.setFieldValue('coverImageUrl', url)
        message.success('图片已载入，请点击「确定」保存商品')
      }
    }
    reader.readAsDataURL(file)
    return false
  }

  const submit = async () => {
    try {
      const v = await form.validateFields()
      const r = upsertTeachingProduct({
        ...v,
        id: editingId ?? v.id.trim(),
        price: Number(v.price),
      })
      if (!r.ok) {
        message.error(r.msg || '保存失败')
        return
      }
      message.success(editingId ? '已更新' : '已创建')
      setOpen(false)
      refresh()
    } catch {
      /* validate only */
    }
  }

  const columns: ColumnsType<TeachingProduct> = [
    {
      key: 'sort',
      align: 'center',
      width: 52,
      render: () => <HolderOutlined style={{ color: '#ccc' }} />,
    },
    {
      title: '封面 / 售价',
      key: 'cover',
      width: 118,
      render: (_, row) => {
        const src =
          row.coverImageUrl?.trim() ||
          `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="54"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${row.coverGradientFrom || '#64748b'}"/><stop offset="100%" stop-color="${row.coverGradientTo || '#334155'}"/></linearGradient></defs><rect width="96" height="54" fill="url(#g)" rx="6"/></svg>`,
          )}`
        const hasImg = Boolean(row.coverImageUrl?.trim())
        return (
          <div style={{ width: 96 }}>
            <Image src={src} alt="" width={96} height={56} style={{ objectFit: 'cover', borderRadius: 6 }} preview={hasImg} />
            <div
              style={{
                marginTop: 6,
                fontWeight: 700,
                fontSize: 14,
                fontVariantNumeric: 'tabular-nums',
                color: '#1677ff',
              }}
            >
              ¥{Number(row.price).toFixed(2)}
            </div>
          </div>
        )
      },
    },
    { title: '商品 ID', dataIndex: 'id', key: 'id', width: 150, ellipsis: true },
    { title: '标题', dataIndex: 'name', key: 'name', ellipsis: true },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{Number(v).toFixed(2)}</span>,
    },
    {
      title: '上架',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (v) => (v !== false ? <Tag color="green">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '操作',
      key: 'act',
      fixed: 'right',
      width: 160,
      render: (_, row) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该学具商品？" onConfirm={() => { deleteTeachingProduct(row.id); message.success('已删除'); refresh() }}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>学具商品配置</h2>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        配置字段：<Typography.Text code>id</Typography.Text>（下单关联）、<Typography.Text code>name</Typography.Text>、
        <Typography.Text code>price</Typography.Text>、<Typography.Text code>desc</Typography.Text>；封面支持<strong>本地上传</strong>（Base64 写入演示存储，建议≤1MB）、图片 URL 或渐变占位。列表「封面 / 售价」列同步展示缩略图与价格。
        列表顺序即为加盟商端展示顺序，可通过左侧把手<strong>拖拽排序</strong>。
        本地存储 Key：<Typography.Text code copyable>{FRANCHISE_TEACHING_CATALOG_LS_KEY}</Typography.Text>
      </Typography.Paragraph>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建商品
        </Button>
        <Button icon={<ReloadOutlined />} onClick={refresh}>
          刷新
        </Button>
        <Popconfirm
          title="恢复为内置演示 6 条商品？"
          description="将覆盖当前本地配置。"
          onConfirm={() => {
            resetTeachingProductsToSeed()
            message.success('已恢复默认')
            refresh()
          }}
        >
          <Button>恢复默认目录</Button>
        </Popconfirm>
      </Space>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={data.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <Table<TeachingProduct>
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 880 }}
            components={{ body: { row: SortableRow } }}
          />
        </SortableContext>
      </DndContext>
      <Modal
        title={editingId ? '编辑学具商品' : '新建学具商品'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          {!editingId ? (
            <Form.Item name="id" label="商品 ID（英文小写、数字、连字符，创建后勿随意改）" rules={[{ required: true, message: '必填' }]}>
              <Input placeholder="例如 ai-tool-kit-01" />
            </Form.Item>
          ) : (
            <Form.Item label="商品 ID">
              <Typography.Text strong>{editingId}</Typography.Text>
            </Form.Item>
          )}
          <Form.Item name="name" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="售价（元）" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="desc" label="简介">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="封面图片">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                listType="picture-card"
                maxCount={1}
                fileList={coverUploadFileList}
                beforeUpload={beforeCoverUpload}
                onRemove={() => {
                  form.setFieldValue('coverImageUrl', '')
                  return true
                }}
              >
                {coverUploadFileList.length >= 1 ? null : (
                  <button type="button" style={{ border: 0, background: 'none', cursor: 'pointer' }}>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>上传</div>
                  </button>
                )}
              </Upload>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                演示环境将图片转为 Base64 写入本地配置（≤1MB）；保存商品后加盟商端可见。
              </Typography.Text>
              <Form.Item name="coverImageUrl" label="或填写图片 URL / 外链" style={{ marginBottom: 0 }}>
                <Input placeholder="https://... 或清空以上传改用渐变" allowClear />
              </Form.Item>
            </Space>
          </Form.Item>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            无封面 URL 时使用渐变（十六进制色）：
          </Typography.Text>
          <Space wrap style={{ width: '100%' }}>
            <Form.Item name="coverGradientFrom" label="渐变起" style={{ minWidth: 140 }}>
              <Input placeholder="#6366f1" />
            </Form.Item>
            <Form.Item name="coverGradientTo" label="渐变止" style={{ minWidth: 140 }}>
              <Input placeholder="#22d3ee" />
            </Form.Item>
            <Form.Item name="coverDot" label="点缀色" style={{ minWidth: 140 }}>
              <Input placeholder="#ffffff" />
            </Form.Item>
          </Space>
          <Form.Item name="enabled" label="上架" valuePropName="checked">
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
