import { useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [step, setStep] = useState<"signup" | "verify">("signup");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  const handleSendCode = async () => {
    if (!email.endsWith("@surrey.ac.uk")) {
      alert("Please use your Surrey email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStep("verify");
      } else {
        alert("Error sending code. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, code }),
      });

      if (res.ok) {
        alert("Account created successfully!");
        navigate("/user-profile")

      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Invalid or expired code.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong verifying code.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-blue-600 text-2xl font-bold text-center">
            Sign Up
          </h2>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {step === "signup" && (
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Enter your Surrey email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button onClick={handleSendCode} disabled={loading}>
                {loading ? "Sending" : "Sign Up"}
              </Button>
            </div>
          )}

          {step === "verify" && (
            <div className="flex flex-col gap-4">
              <p className="text-center text-gray-600">
                We sent a code to <span className="font-semibold">{email}</span>
              </p>
              <Input
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button onClick={handleVerifyCode}>Verify</Button>
              <p className="text-sm text-gray-500 text-center">
                Didn't get the code?{" "}
                <span
                  onClick={handleSendCode}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Resend
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
