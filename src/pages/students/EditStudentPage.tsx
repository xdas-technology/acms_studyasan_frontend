import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  studentService,
  boardService,
  classService,
  locationService,
} from "@/services/api";
import type {
  Board,
  Class,
  Student,
  UpdateStudentData,
  Country,
  State,
  City,
} from "@/types";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import SuccessModal from "@/components/ui/successModal";
import ErrorModal from "@/components/ui/errorModal";

export default function EditStudentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [student, setStudent] = useState<Student | null>(null);

  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null
  );
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [successOpen, setSuccessOpen] = useState(false);

  const [formData, setFormData] = useState<UpdateStudentData>({
    class_id: null,
    board_id: null,
    date_of_birth: null,
    gender: null,
    school: null,
    blood_group: null,
    addressLine: undefined,
    countryId: undefined,
    stateId: undefined,
    cityId: undefined,
    postalCode: undefined,
  });

  useEffect(() => {
    fetchBoards();
    fetchClasses();
    fetchCountries();
    if (id) {
      fetchStudent(parseInt(id));
    }
  }, [id]);

  const fetchStudent = async (studentId: number) => {
    setIsLoading(true);
    try {
      const response = await studentService.getById(studentId);
      setStudent(response.data);

      // FIX: Convert date_of_birth from ISO string to YYYY-MM-DD format for HTML date input
      let formattedDateOfBirth = null;
      if (response.data.date_of_birth) {
        const date = new Date(response.data.date_of_birth);
        if (!isNaN(date.getTime())) {
          // Get local date parts (not UTC)
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          formattedDateOfBirth = `${year}-${month}-${day}`;
        }
      }

      // Set initial form data from student
      const initialData: UpdateStudentData = {
        class_id: response.data.class_id,
        board_id: response.data.board_id,
        date_of_birth: formattedDateOfBirth, // Use the formatted date
        gender: response.data.gender,
        school: response.data.school,
        blood_group: response.data.blood_group || null,
        addressLine: undefined,
        countryId: undefined,
        stateId: undefined,
        cityId: undefined,
        postalCode: undefined,
      };

      // If student has address, load it
      if (response.data.address) {
        const address = response.data.address;
        initialData.addressLine = address.addressLine;
        initialData.countryId = address.country.id;
        initialData.stateId = address.state.id;
        initialData.cityId = address.city.id;
        initialData.postalCode = address.postalCode || "";

        // Set selected IDs for dropdowns
        setSelectedCountryId(address.country.id);
        setSelectedStateId(address.state.id);

        // Fetch states for this country
        if (address.country.id) {
          try {
            const statesData = await locationService.getStatesByCountry(
              address.country.id
            );
            setStates(statesData);
          } catch (error) {
            console.error("Failed to load states:", error);
          }
        }

        // Fetch cities for this state
        if (address.state.id) {
          try {
            const citiesData = await locationService.getCitiesByState(
              address.state.id
            );
            setCities(citiesData);
          } catch (error) {
            console.error("Failed to load cities:", error);
          }
        }
      }

      setFormData(initialData);
    } catch (error) {
      setErrorMessage("Failed to load student data.");
      setErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await boardService.getAll({ limit: 100 });
      setBoards(response.data.data);
    } catch {
      setErrorMessage("Failed to load boards.");
      setErrorOpen(true);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll({ limit: 100 });
      setClasses(response.data.data);
    } catch {
      setErrorMessage("Failed to load classes.");
      setErrorOpen(true);
    }
  };

  const fetchCountries = async () => {
    try {
      const data = await locationService.getCountries();
      setCountries(data);
    } catch {
      console.error("Failed to load countries");
    }
  };

  const fetchStatesByCountry = async (countryId: number) => {
    try {
      const data = await locationService.getStatesByCountry(countryId);
      setStates(data);
    } catch {
      console.error("Failed to load states");
    }
  };

  const fetchCitiesByState = async (stateId: number) => {
    try {
      const data = await locationService.getCitiesByState(stateId);
      setCities(data);
    } catch {
      console.error("Failed to load cities");
    }
  };

  const handleCountryChange = (value: string) => {
    if (value === "none") {
      setSelectedCountryId(null);
      setSelectedStateId(null);
      handleChange("countryId", null);
      handleChange("stateId", null);
      handleChange("cityId", null);
      setStates([]);
      setCities([]);
    } else {
      const id = parseInt(value);
      setSelectedCountryId(id);
      setSelectedStateId(null);
      handleChange("countryId", id);
      handleChange("stateId", null);
      handleChange("cityId", null);
      setStates([]);
      setCities([]);

      if (id) {
        fetchStatesByCountry(id);
      }
    }
  };

  const handleStateChange = (value: string) => {
    if (value === "none") {
      setSelectedStateId(null);
      handleChange("stateId", null);
      handleChange("cityId", null);
      setCities([]);
    } else {
      const id = parseInt(value);
      setSelectedStateId(id);
      handleChange("stateId", id);
      handleChange("cityId", null);
      setCities([]);

      if (id) {
        fetchCitiesByState(id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);

    try {
      // Validate address - all or nothing
      const hasAnyAddressField =
        formData.addressLine ||
        formData.countryId ||
        formData.stateId ||
        formData.cityId ||
        formData.postalCode;
      const hasAllAddressFields =
        formData.addressLine &&
        formData.countryId &&
        formData.stateId &&
        formData.cityId &&
        formData.postalCode;

      if (hasAnyAddressField && !hasAllAddressFields) {
        setErrorMessage(
          "If updating address, all address fields (Address, Country, State, City, Postal Code) are required."
        );
        setErrorOpen(true);
        setIsSaving(false);
        return;
      }

      // Transform blood group from frontend format (A+) to backend format (A_POS)
      const transformedData = {
        ...formData,
        blood_group: formData.blood_group
          ? formData.blood_group.replace("+", "_POS").replace("-", "_NEG")
          : null,
        // date_of_birth is already in YYYY-MM-DD format, backend will parse it with new Date()
      };

      // Remove undefined values
      const cleanData: UpdateStudentData = {};

Object.entries(transformedData).forEach(([key, value]) => {
  if (value !== undefined && value !== null) {
    (cleanData as any)[key] = value ?? null;
  }
});

      console.log("Updating student with data:", cleanData);

      await studentService.update(parseInt(id), cleanData);
      setSuccessOpen(true);
    } catch (err: any) {
      console.error("Error updating student:", err);
      const msg = err.response?.data?.message || "Failed to update student.";
      setErrorMessage(msg);
      setErrorOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateStudentData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        value === ""
          ? field === "addressLine" || field === "postalCode"
            ? ""
            : null
          : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg font-medium">Student not found</p>
        <Button
          onClick={() => navigate("/dashboard/students")}
          className="mt-4"
        >
          Back to Students
        </Button>
      </div>
    );
  }

  // Function to convert backend blood group format to frontend display format
  function formatBloodGroupForDisplay(bg: string | null): string | null {
    if (!bg) return null;
    return bg.replace("_POS", "+").replace("_NEG", "-");
  }

  return (
    <div className="space-y-6">
      {/* SUCCESS MODAL */}
      <SuccessModal
        open={successOpen}
        title="Student Updated Successfully"
        description={`Details for ${student.user.name} have been updated.`}
        showButtons={true}
        okText="OK"
        cancelText="Go Back"
        onConfirm={() => setSuccessOpen(false)}
        onCancel={() => navigate("/dashboard/students")}
        onClose={() => setSuccessOpen(false)}
      />

      {/* ERROR MODAL */}
      <ErrorModal
        open={errorOpen}
        title="Error"
        description={errorMessage}
        okText="Close"
        showButtons={true}
        onConfirm={() => setErrorOpen(false)}
        onClose={() => setErrorOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => navigate("/dashboard/students")}
          className="flex items-center text-blue-600 text-sm hover:underline w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Students
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-600">
            Edit Student
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Update student details for {student.user.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Information Card (read-only) */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl text-gray-600">
                User Information
              </CardTitle>
              <CardDescription>Account information (read-only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-600">Full Name</Label>
                <Input value={student.user.name} disabled />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Email</Label>
                <Input value={student.user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Phone</Label>
                <Input value={student.user.phone} disabled />
              </div>
              <p className="text-xs text-muted-foreground">
                User account details cannot be edited here.
              </p>
            </CardContent>
          </Card>

          {/* Editable Student Info */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl text-gray-600">
                Student Details
              </CardTitle>
              <CardDescription>Update student information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class" className="text-gray-600">
                  Class
                </Label>
                <Select
                  value={formData.class_id?.toString() || "none"}
                  onValueChange={(value) =>
                    handleChange(
                      "class_id",
                      value === "none" ? null : parseInt(value)
                    )
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="board" className="text-gray-600">
                  Board
                </Label>
                <Select
                  value={formData.board_id?.toString() || "none"}
                  onValueChange={(value) =>
                    handleChange(
                      "board_id",
                      value === "none" ? null : parseInt(value)
                    )
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger id="board">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id.toString()}>
                        {board.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-gray-600">
                  Gender
                </Label>
                <Select
                  value={formData.gender || "none"}
                  onValueChange={(value) =>
                    handleChange("gender", value === "none" ? null : value)
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-gray-600">
                  Date of Birth
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ""}
                  onChange={(e) =>
                    handleChange("date_of_birth", e.target.value)
                  }
                  disabled={isSaving}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school" className="text-gray-600">
                  School
                </Label>
                <Input
                  id="school"
                  placeholder="ABC High School"
                  value={formData.school || ""}
                  onChange={(e) => handleChange("school", e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group" className="text-gray-600">
                  Blood Group
                </Label>
                <Select
                  value={
                    formatBloodGroupForDisplay(formData.blood_group ?? null) ??
                    "none"
                  }
                  onValueChange={(value) =>
                    handleChange("blood_group", value === "none" ? null : value)
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger id="blood_group">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Address Section - NEW */}
          <Card className="w-full md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl text-gray-600">Address</CardTitle>
              <CardDescription>
                Update student address. All fields must be filled to save
                address.
                {student.address && (
                  <span className="text-green-600 ml-2">✓ Address exists</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine" className="text-gray-600">
                  Address
                </Label>
                <Textarea
                  id="addressLine"
                  placeholder="123 Main Street, Apartment, etc."
                  value={formData.addressLine || ""}
                  onChange={(e) => handleChange("addressLine", e.target.value)}
                  disabled={isSaving}
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-gray-600">
                    Country
                  </Label>
                  <Select
                    value={formData.countryId?.toString() || "none"}
                    onValueChange={handleCountryChange}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a country</SelectItem>
                      {countries.map((country) => (
                        <SelectItem
                          key={country.id}
                          value={country.id.toString()}
                        >
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-gray-600">
                    State
                  </Label>
                  <Select
                    value={formData.stateId?.toString() || "none"}
                    onValueChange={handleStateChange}
                    disabled={!selectedCountryId || isSaving}
                  >
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a state</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.id.toString()}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-600">
                    City
                  </Label>
                  <Select
                    value={formData.cityId?.toString() || "none"}
                    onValueChange={(value) =>
                      handleChange(
                        "cityId",
                        value === "none" ? null : parseInt(value)
                      )
                    }
                    disabled={!selectedStateId || isSaving}
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a city</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-gray-600">
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    placeholder="123456"
                    value={formData.postalCode || ""}
                    onChange={(e) => handleChange("postalCode", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/students")}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
