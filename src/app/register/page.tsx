"use client";

import { useState } from "react";
import {
  Column,
  Heading,
  Text,
  Button,
  Input,
  Flex,
  Badge,
  Card,
  IconButton,
} from "@once-ui-system/core";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    midName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phoneNumber: "",
    cellNumber: "",
    nationality: "",
    placeOfBirth: "",
    callingCode: "",
    countryCallingCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.firstName,
          mid_name: formData.midName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          date_of_birth: formData.dateOfBirth,
          address_line_1: formData.addressLine1,
          address_line_2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zip_code: formData.zipCode,
          phone_number: formData.phoneNumber,
          cell_number: formData.cellNumber,
          nationality: formData.nationality,
          place_of_birth: formData.placeOfBirth,
          calling_code: formData.callingCode,
          country_calling_code: formData.countryCallingCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccessMessage(
          data.message ||
            "Registration successful! Please check your email to verify your account."
        );
        setFormData({
          firstName: "",
          midName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          gender: "",
          dateOfBirth: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
          phoneNumber: "",
          cellNumber: "",
          nationality: "",
          placeOfBirth: "",
          callingCode: "",
          countryCallingCode: "",
        });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    id: string,
    label: string,
    type: string = "text",
    placeholder: string = "",
    required = false
  ) => (
    <div className="space-y-2">
      <Text weight="medium" color="neutral-weak">
        {label}
      </Text>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={formData[id as keyof typeof formData] as string}
        onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
        className="h-12 rounded-lg border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:border-blue-400 focus:ring-blue-400"
        required={required}
      />
    </div>
  );

  return (
    <Flex fillWidth fillHeight center padding="l">
      <Card
        shadow="xl"
        radius="xl"
        padding="xl"
        style={{ maxWidth: "900px", width: "100%" }}
      >
        <Flex
          fillWidth
          wrap
          gap="l"
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          {/* Left side: form */}
          <Column
            flex={1}
            gap="l"
            align="center"
            justify="center"
            style={{ minWidth: "280px" }}
          >
            <Badge textVariant="label-default-m">KripiCard</Badge>
            <Heading variant="display-strong-l" marginTop="8" align="center">
              Create Your Account
            </Heading>
            <Text onBackground="neutral-weak" align="center" marginBottom="16">
              Join KripiCard and start using virtual cards today.
            </Text>

            <form
              onSubmit={handleSubmit}
              style={{ width: "100%", maxWidth: "360px" }}
            >
              <Column gap="m">
                {renderInput("firstName", "First Name", "text", "Enter your first name", true)}
                {renderInput("midName", "Middle Name")}
                {renderInput("lastName", "Last Name", "text", "Enter your last name", true)}
                {renderInput("email", "Email Address", "email", "Enter your email", true)}
                {renderInput("gender", "Gender", "text", "M/F/Other")}
                {renderInput("dateOfBirth", "Date of Birth", "date")}
                {renderInput("addressLine1", "Address Line 1")}
                {renderInput("addressLine2", "Address Line 2")}
                {renderInput("city", "City")}
                {renderInput("state", "State")}
                {renderInput("country", "Country")}
                {renderInput("zipCode", "Zip Code")}
                {renderInput("phoneNumber", "Phone Number")}
                {renderInput("cellNumber", "Cell Number")}
                {renderInput("nationality", "Nationality")}
                {renderInput("placeOfBirth", "Place of Birth")}
                {renderInput("callingCode", "Calling Code")}
                {renderInput("countryCallingCode", "Country Calling Code")}

                {/* Password */}
                <div className="space-y-2 relative">
                  <Text weight="medium" color="neutral-weak">Password</Text>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="h-12 rounded-lg border-gray-700 bg-gray-900 text-white placeholder-gray-500 pr-12 focus:border-blue-400 focus:ring-blue-400"
                    required
                  />
                  <IconButton
                    icon={showPassword ? <EyeOff /> : <Eye />}
                    variant="ghost"
                    size="m"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "8px", top: "8px" }}
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2 relative">
                  <Text weight="medium" color="neutral-weak">Confirm Password</Text>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="h-12 rounded-lg border-gray-700 bg-gray-900 text-white placeholder-gray-500 pr-12 focus:border-blue-400 focus:ring-blue-400"
                    required
                  />
                  <IconButton
                    icon={showConfirmPassword ? <EyeOff /> : <Eye />}
                    variant="ghost"
                    size="m"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: "absolute", right: "8px", top: "8px" }}
                  />
                </div>

                {error && <Text color="danger-strong" align="center">{error}</Text>}
                {successMessage && <Text color="success-strong" align="center">{successMessage}</Text>}

                <Button type="submit" size="l" fillWidth disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </Column>
            </form>

            <Text onBackground="neutral-weak" align="center" marginTop="12">
              Already have an account?{" "}
              <a href="/login" style={{ color: "#3b82f6" }}>
                Login
              </a>
            </Text>
          </Column>

          {/* Right side: illustration */}
          <Flex
            flex={1}
            center
            style={{ minWidth: "280px", justifyContent: "center", marginTop: "16px" }}
          >
            <img
              src="login-illustration.png"
              alt="Register Illustration"
              style={{ maxWidth: "400px", width: "100%", borderRadius: "12px" }}
            />
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}

