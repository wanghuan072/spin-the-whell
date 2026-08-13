"use client";

import { useCallback, useEffect, useState } from "react";
import {
  App as AntApp,
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  Layout,
  Menu,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  type MenuProps,
  type TableProps,
} from "antd";
import CommentOutlined from "@ant-design/icons/CommentOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import MenuFoldOutlined from "@ant-design/icons/MenuFoldOutlined";
import MoreOutlined from "@ant-design/icons/MoreOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import {
  createComment,
  deleteComment,
  getAdminComments,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  updateComment,
  type AdminUser,
  type CommentInput,
} from "@/lib/comment-api/admin";
import { ApiError } from "@/lib/comment-api/core";
import type { AdminComment, CommentStatus, Pagination } from "@/types/comment";

const { Header, Content, Sider } = Layout;
const emptyPagination: Pagination = { total: 0, page: 1, limit: 20, pages: 1 };
const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export function AdminPage() {
  return (
    <ConfigProvider theme={{
      token: { colorPrimary: "#4f46e5", borderRadius: 8, colorBgLayout: "#f4f6f8", fontSize: 14 },
      components: { Layout: { siderBg: "#111827", headerBg: "#ffffff" }, Table: { headerBg: "#f8fafc" } },
    }}>
      <AntApp><AdminGate /></AntApp>
    </ConfigProvider>
  );
}

function AdminGate() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentAdmin().then(({ admin: current }) => setAdmin(current)).catch(() => setAdmin(null)).finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="admin-loading"><Spin size="large" /><span>Checking your session…</span></div>;
  if (!admin) return <LoginScreen onAuthenticated={setAdmin} />;
  return <CommentDashboard admin={admin} onSignedOut={() => setAdmin(null)} />;
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: (admin: AdminUser) => void }) {
  const { message } = AntApp.useApp();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(values: { username: string; password: string }) {
    setSubmitting(true);
    try {
      const result = await loginAdmin(values.username, values.password);
      onAuthenticated(result.admin);
    } catch (error) {
      void message.error(error instanceof Error ? error.message : "Sign-in failed.");
    } finally { setSubmitting(false); }
  }

  return (
    <main className="admin-login">
      <section className="admin-login-card">
        <div className="admin-login-brand"><span><CommentOutlined /></span><div><strong>Wheel Console</strong><small>Content administration</small></div></div>
        <div className="admin-login-copy"><Typography.Title level={2}>Welcome back</Typography.Title><Typography.Paragraph type="secondary">Sign in to manage community comments.</Typography.Paragraph></div>
        <Form layout="vertical" requiredMark={false} onFinish={handleLogin} autoComplete="off">
          <Form.Item label="Username" name="username" rules={[{ required: true, message: "Enter your username." }]}><Input size="large" autoComplete="username" /></Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: "Enter your password." }]}><Input.Password size="large" autoComplete="current-password" /></Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={submitting}>Sign in</Button>
        </Form>
        <p className="admin-login-note">This private page is excluded from search indexing.</p>
      </section>
    </main>
  );
}

function CommentDashboard({ admin, onSignedOut }: { admin: AdminUser; onSignedOut: () => void }) {
  const { message, modal } = AntApp.useApp();
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<"all" | CommentStatus>("all");
  const [editor, setEditor] = useState<{ open: boolean; comment: AdminComment | null }>({ open: false, comment: null });
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<CommentInput>();

  const loadComments = useCallback(async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const result = await getAdminComments({ page, limit, search, status });
      setComments(result.items);
      setPagination(result.pagination);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) onSignedOut();
      else void message.error(error instanceof Error ? error.message : "Comments could not be loaded.");
    } finally { setLoading(false); }
  }, [message, onSignedOut, pagination.limit, search, status]);

  useEffect(() => {
    let active = true;
    getAdminComments({ page: 1, limit: pagination.limit, search, status })
      .then((result) => {
        if (!active) return;
        setComments(result.items);
        setPagination(result.pagination);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) onSignedOut();
        else void message.error(error instanceof Error ? error.message : "Comments could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [message, onSignedOut, pagination.limit, search, status]);

  function openEditor(comment: AdminComment | null) {
    setEditor({ open: true, comment });
    form.setFieldsValue(comment ? { username: comment.username, body: comment.body, status: comment.status } : { username: "", body: "", status: "published" });
  }

  async function saveEditor() {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editor.comment) await updateComment(editor.comment.id, values);
      else await createComment(values);
      void message.success(editor.comment ? "Comment updated." : "Comment created.");
      setEditor({ open: false, comment: null });
      await loadComments(editor.comment ? pagination.page : 1);
    } catch (error) {
      if (!(error && typeof error === "object" && "errorFields" in error)) void message.error(error instanceof Error ? error.message : "Changes could not be saved.");
    } finally { setSaving(false); }
  }

  async function toggleVisibility(comment: AdminComment) {
    const nextStatus = comment.status === "published" ? "hidden" : "published";
    try {
      await updateComment(comment.id, { status: nextStatus });
      void message.success(nextStatus === "hidden" ? "Comment hidden." : "Comment published.");
      await loadComments(pagination.page);
    } catch (error) { void message.error(error instanceof Error ? error.message : "Status could not be changed."); }
  }

  function confirmDelete(comment: AdminComment) {
    modal.confirm({
      title: "Delete this comment?",
      content: `The message from ${comment.username} will be permanently removed.`,
      okText: "Delete", okButtonProps: { danger: true },
      async onOk() { await deleteComment(comment.id); void message.success("Comment deleted."); await loadComments(pagination.page); },
    });
  }

  const columns: TableProps<AdminComment>["columns"] = [
    { title: "Author", dataIndex: "username", width: 180, render: (value: string) => <strong>{value}</strong> },
    { title: "Comment", dataIndex: "body", ellipsis: true, render: (value: string) => <span className="admin-comment-cell">{value}</span> },
    { title: "Status", dataIndex: "status", width: 120, render: (value: CommentStatus) => <Tag color={value === "published" ? "green" : "default"}>{value === "published" ? "Published" : "Hidden"}</Tag> },
    { title: "Created", dataIndex: "createdAt", width: 190, render: (value: string) => dateFormatter.format(new Date(value)) },
    { title: "", key: "actions", width: 58, fixed: "right", render: (_value, record) => {
      const items: MenuProps["items"] = [
        { key: "edit", icon: <EditOutlined />, label: "Edit", onClick: () => openEditor(record) },
        { key: "visibility", icon: record.status === "published" ? <EyeInvisibleOutlined /> : <EyeOutlined />, label: record.status === "published" ? "Hide" : "Publish", onClick: () => void toggleVisibility(record) },
        { type: "divider" },
        { key: "delete", danger: true, icon: <DeleteOutlined />, label: "Delete", onClick: () => confirmDelete(record) },
      ];
      return <Dropdown menu={{ items }} trigger={["click"]}><Button type="text" aria-label={`Actions for ${record.username}`} icon={<MoreOutlined />} /></Dropdown>;
    } },
  ];

  async function signOut() {
    try { await logoutAdmin(); } finally { onSignedOut(); }
  }

  return (
    <Layout className="admin-layout">
      <Sider width={238} breakpoint="lg" collapsedWidth="0" trigger={<MenuFoldOutlined />}>
        <div className="admin-sidebar-brand"><span><CommentOutlined /></span><div><strong>Wheel Console</strong><small>Administration</small></div></div>
        <Menu theme="dark" mode="inline" selectedKeys={["comments"]} items={[{ key: "comments", icon: <CommentOutlined />, label: "Comments" }]} />
        <a className="admin-view-site" href="/comments" target="_blank" rel="noreferrer"><EyeOutlined /> View public page</a>
      </Sider>
      <Layout>
        <Header className="admin-header"><span className="admin-header-section">Community / Comments</span><Space><span className="admin-user">{admin.username}</span><Button type="text" icon={<LogoutOutlined />} onClick={() => void signOut()}>Sign out</Button></Space></Header>
        <Content className="admin-content">
          <div className="admin-title-row"><div><Typography.Title level={2}>Comments</Typography.Title><Typography.Paragraph type="secondary">Create, edit, publish, hide, and remove community messages.</Typography.Paragraph></div><Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor(null)}>New comment</Button></div>
          <section className="admin-table-card">
            <div className="admin-toolbar">
              <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onPressEnter={() => setSearch(searchInput.trim())} allowClear onClear={() => { setSearchInput(""); setSearch(""); }} prefix={<SearchOutlined />} placeholder="Search author or comment" className="admin-search" />
              <Select value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, { value: "published", label: "Published" }, { value: "hidden", label: "Hidden" }]} />
              <Button onClick={() => setSearch(searchInput.trim())}>Search</Button>
            </div>
            <Table rowKey="id" columns={columns} dataSource={comments} loading={loading} scroll={{ x: 880 }} locale={{ emptyText: <Empty description="No comments found" /> }} pagination={{ current: pagination.page, pageSize: pagination.limit, total: pagination.total, showSizeChanger: true, showTotal: (total) => `${total} comments`, onChange: (page, size) => void loadComments(page, size) }} />
          </section>
        </Content>
      </Layout>
      <Drawer title={editor.comment ? "Edit comment" : "Create comment"} width={480} open={editor.open} onClose={() => setEditor({ open: false, comment: null })} extra={<Space><Button onClick={() => setEditor({ open: false, comment: null })}>Cancel</Button><Button type="primary" loading={saving} onClick={() => void saveEditor()}>Save</Button></Space>}>
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item label="Username" name="username" rules={[{ required: true }, { min: 2 }, { max: 40 }]}><Input maxLength={40} showCount /></Form.Item>
          <Form.Item label="Comment" name="body" rules={[{ required: true }, { min: 3 }, { max: 1000 }]}><Input.TextArea rows={8} maxLength={1000} showCount /></Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}><Select options={[{ value: "published", label: "Published — visible publicly" }, { value: "hidden", label: "Hidden — admin only" }]} /></Form.Item>
        </Form>
      </Drawer>
    </Layout>
  );
}
