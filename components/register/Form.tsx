"use client";
import React, { useState, ChangeEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Check,
  User,
  School,
  FileText,
  CreditCard,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const OlympiaXRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const [formData, setFormData] = useState({
    // Step 1
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    // Step 2
    class: "",
    schoolName: "",
    board: "",
    schoolAddressLine1: "",
    schoolCity: "",
    schoolState: "",
    schoolZipCode: "",
    schoolCountry: "",
    medium: "",
    // Step 4
    subjects: [] as string[],
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    passportPhoto: File | null;
    uidAadhaar: File | null;
    schoolId: File | null;
  }>({
    passportPhoto: null,
    uidAadhaar: null,
    schoolId: null,
  });

  const [errors, setErrors] = useState<{
    passportPhoto?: string;
    idChoice?: string;
    submit?: string;
  }>({});

  const stepTitles = [
    { title: "General Details", icon: User },
    { title: "Academic Details", icon: School },
    { title: "ID Verification", icon: FileText },
    { title: "Registration/Payment", icon: CreditCard },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (field: "passportPhoto" | "uidAadhaar" | "schoolId", e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadedFiles((prev) => ({ ...prev, [field]: file }));
    // clear related error
    setErrors((prev) => {
      const copy = { ...prev };
      if (field === "passportPhoto") delete copy.passportPhoto;
      if (field === "uidAadhaar" || field === "schoolId") delete copy.idChoice;
      return copy;
    });
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s: string) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const nextStep = () => {
    setCurrentStep((s) => Math.min(totalSteps, s + 1));
  };
  const prevStep = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const validateStep3 = () => {
    const newErrors: typeof errors = {};
    if (!uploadedFiles.passportPhoto) {
      newErrors.passportPhoto = "Passport photo is required.";
    }
    if (!uploadedFiles.uidAadhaar && !uploadedFiles.schoolId) {
      newErrors.idChoice = "Either UID/Aadhaar or School ID is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate step 3 before sending
    if (!validateStep3()) {
      setCurrentStep(3);
      return;
    }

    const fd = new FormData();
    // Step1
    fd.append("first_name", formData.firstName);
    fd.append("last_name", formData.lastName);
    fd.append("phone", formData.phone);
    fd.append("date_of_birth", formData.dateOfBirth);
    fd.append("email", formData.email);
    fd.append("address_line1", formData.addressLine1);
    fd.append("address_line2", formData.addressLine2);
    fd.append("city", formData.city);
    fd.append("state", formData.state);
    fd.append("zip_code", formData.zipCode);
    fd.append("country", formData.country);
    // Step2
    fd.append("class", formData.class);
    fd.append("school_name", formData.schoolName);
    fd.append("board", formData.board);
    fd.append("school_address_line1", formData.schoolAddressLine1);
    fd.append("school_city", formData.schoolCity);
    fd.append("school_state", formData.schoolState);
    fd.append("school_zip_code", formData.schoolZipCode);
    fd.append("school_country", formData.schoolCountry);
    fd.append("medium", formData.medium);
    // Subjects
    fd.append("subjects", (formData.subjects || []).join(","));
    // Files
    if (uploadedFiles.passportPhoto) fd.append("passport_photo", uploadedFiles.passportPhoto);
    if (uploadedFiles.uidAadhaar) fd.append("uid_aadhaar", uploadedFiles.uidAadhaar);
    if (uploadedFiles.schoolId) fd.append("school_id", uploadedFiles.schoolId);

    try {
      const resp = await axios.post("http://localhost:4000/register", fd, {
        withCredentials: true,
        headers: {
          // Let axios set multipart boundary automatically
        },
      });
      console.log("Registration success:", resp.data);
      alert("Registration successful!");
    } catch (e) {
      console.error("Submission failed:", e);
      setErrors({ submit: "Submission failed. Try again." });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">General Details</h2>
        <p className="text-gray-600">Some Description About This Section</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="Enter Your First Name"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Enter Your Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone/Mobile <span className="text-red-500">*</span>
        </Label>
        <div className="flex">
          <div className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
            <span className="text-orange-500">🇮🇳</span>
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="Mobile Number"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="rounded-l-none"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">
          Date Of Birth <span className="text-red-500">*</span>
        </Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Permanent Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">
              Address Line 1 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="addressLine1"
              placeholder="Address Line 1"
              value={formData.addressLine1}
              onChange={(e) => handleInputChange("addressLine1", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              placeholder="Address Line 2"
              value={formData.addressLine2}
              onChange={(e) => handleInputChange("addressLine2", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              placeholder="City"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              placeholder="State"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zipCode">
              Zip Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="zipCode"
              placeholder="Zip"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.country} onValueChange={(v) => handleInputChange("country", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="class">
          Select Class <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.class} onValueChange={(v) => handleInputChange("class", v)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select Class--" />
          </SelectTrigger>
          <SelectContent>
            {["6", "7", "8", "9", "10", "11", "12"].map((c) => (
              <SelectItem key={c} value={c}>
                Class {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="schoolName">
          School Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="schoolName"
          placeholder="Enter School Name"
          value={formData.schoolName}
          onChange={(e) => handleInputChange("schoolName", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="board">
          Select Board <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.board} onValueChange={(v) => handleInputChange("board", v)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select Board--" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CBSE">CBSE</SelectItem>
            <SelectItem value="ICSE">ICSE</SelectItem>
            <SelectItem value="State Board">State Board</SelectItem>
            <SelectItem value="IB">International Baccalaureate</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">School Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="schoolAddressLine1">
              Address Line 1 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="schoolAddressLine1"
              placeholder="Address Line 1"
              value={formData.schoolAddressLine1}
              onChange={(e) => handleInputChange("schoolAddressLine1", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolCity">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="schoolCity"
              placeholder="City"
              value={formData.schoolCity}
              onChange={(e) => handleInputChange("schoolCity", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="schoolState">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="schoolState"
              placeholder="State"
              value={formData.schoolState}
              onChange={(e) => handleInputChange("schoolState", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolZipCode">
              Zip Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="schoolZipCode"
              placeholder="Zip"
              value={formData.schoolZipCode}
              onChange={(e) => handleInputChange("schoolZipCode", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="schoolCountry">
            Country <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.schoolCountry} onValueChange={(v) => handleInputChange("schoolCountry", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">India</SelectItem>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="medium">
          Medium <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.medium} onValueChange={(v) => handleInputChange("medium", v)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select Medium --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Hindi">Hindi</SelectItem>
            <SelectItem value="Regional Language">Regional Language</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ID Verification</h2>
        <p className="text-gray-600">Some Description About This Section</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Passport Photo */}
        <Card className="p-4 border-dashed border-2 border-gray-300 hover:border-blue-500 transition-colors">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <Label htmlFor="passportPhoto" className="cursor-pointer inline-flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Passport Photo <span className="text-red-500">*</span></span>
            </Label>
            <Input
              id="passportPhoto"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload("passportPhoto", e)}
            />
            {uploadedFiles.passportPhoto && (
              <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" /> {uploadedFiles.passportPhoto.name}
              </p>
            )}
            {errors.passportPhoto && <p className="text-sm text-red-500 mt-1">{errors.passportPhoto}</p>}
          </div>
        </Card>

        {/* UID/Aadhaar */}
        <Card className="p-4 border-dashed border-2 border-gray-300 hover:border-blue-500 transition-colors">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <Label htmlFor="uidAadhaar" className="cursor-pointer inline-flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">UID / Aadhaar Card</span>
            </Label>
            <Input
              id="uidAadhaar"
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFileUpload("uidAadhaar", e)}
            />
            {uploadedFiles.uidAadhaar && (
              <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" /> {uploadedFiles.uidAadhaar.name}
              </p>
            )}
          </div>
        </Card>

        {/* School ID */}
        <Card className="p-4 border-dashed border-2 border-gray-300 hover:border-blue-500 transition-colors">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <Label htmlFor="schoolId" className="cursor-pointer inline-flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">School ID Card</span>
            </Label>
            <Input
              id="schoolId"
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFileUpload("schoolId", e)}
            />
            {uploadedFiles.schoolId && (
              <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" /> {uploadedFiles.schoolId.name}
              </p>
            )}
          </div>
        </Card>
      </div>
      {!uploadedFiles.uidAadhaar && !uploadedFiles.schoolId && (
        <p className="text-sm text-red-500">Either UID/Aadhaar or School ID is required.</p>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Olympia-X Registration/Payment</h2>
        <p className="text-gray-600">Some Description About This Section</p>
      </div>

      <div className="space-y-4">
        <Label>
          Select Subjects <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-3">
          {["Physics", "Maths", "Chemistry", "Biology"].map((subject) => (
            <div key={subject} className="flex items-center space-x-2">
              <Checkbox
                id={subject}
                checked={formData.subjects.includes(subject)}
                onCheckedChange={() => handleSubjectToggle(subject)}
              />
              <Label htmlFor={subject} className="text-sm font-normal">
                {subject}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-800 text-sm">
          No Activated Payment Method Found. If You Are An Admin Please Check The Payment Settings
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((step, index) => {
              const StepIcon = step.icon;
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div
                      className={`w-16 h-0.5 ml-2 ${
                        stepNumber < currentStep ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mb-4">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps} - {stepTitles[currentStep - 1].title}
            </span>
          </div>

          <Progress value={progressPercentage} className="w-full h-2" />
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {errors.submit && <p className="text-sm text-red-600 mt-2">{errors.submit}</p>}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={() => {
                    if (currentStep === 3) {
                      if (validateStep3()) nextStep();
                      else setCurrentStep(3);
                    } else nextStep();
                  }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Submit Form
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OlympiaXRegistrationForm;
