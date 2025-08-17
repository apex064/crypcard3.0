"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  Column,
  Row,
  Heading,
  Text,
  Badge,
} from "@once-ui-system/core";

interface UserData {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // --- Fetch all users ---
  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { headers: authHeader });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      setUsers(data.users || []);
    } catch (err: any) {
      alert(err.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Actions ---
  const createUser = async () => {
    if (!newEmail || !newPassword) return alert("Email and password required");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          action: "create_user",
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      alert("User created!");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Error creating user");
    }
  };

  const updateUserRole = async (userId: number, role: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          action: "update_user_role",
          userId,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      alert("User role updated!");
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Error updating role");
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ action: "delete_user", userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      alert("User deleted!");
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Error deleting user");
    }
  };

  const getRoleBadge = (role: string) => {
    const variant = role === "admin" ? "success" : "neutral";
    return <Badge variant={variant}>{role}</Badge>;
  };

  return (
    <Column fillWidth padding="l" gap="l">
      <Row justify="space-between" align="center">
        <Heading variant="display-strong-xl">Admin Users</Heading>
        <Button
          variant="destructive"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
        >
          Logout
        </Button>
      </Row>

      {/* Create New User */}
      <Card padding="l" radius="l" border="neutral-alpha-medium">
        <Column gap="m">
          <Heading variant="heading-default-xl">Create User</Heading>
          <Row gap="m" align="center">
            <Input
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={{ width: "200px" }}
            />
            <Input
              placeholder="Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "150px" }}
            />
            {/* Native select replaces Once UI Select */}
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{ width: "120px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <Button variant="primary" onClick={createUser}>
              Create
            </Button>
          </Row>
        </Column>
      </Card>

      {/* Users List */}
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Column gap="s">
          {users.map((user) => (
            <Card key={user.id} padding="l" radius="l" border="neutral-alpha-medium">
              <Row justify="space-between" align="center">
                <Column gap="xs">
                  <Text>ID: {user.id} | Email: {user.email}</Text>
                  <Text>Created At: {new Date(user.created_at).toLocaleString()}</Text>
                </Column>
                <Row gap="s" align="center">
                  {getRoleBadge(user.role)}
                  {/* Native select replaces Once UI Select */}
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    style={{ width: "120px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>
                    Delete
                  </Button>
                </Row>
              </Row>
            </Card>
          ))}
        </Column>
      )}
    </Column>
  );
}
