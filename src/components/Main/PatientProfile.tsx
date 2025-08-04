import { useState, useEffect } from "react";
import { fetchPatients } from "../../Api/PatientsApi";
import birthIcon from "../../assets/birthIcon.svg";
import femaleIcon from "../../assets/femaleIcon.svg";
import phoneIcon from "../../assets/phoneIcon.svg";
import insuranceIcon from "../../assets/insuranceIcon.svg";

interface IPatientFromApi {
  id: number;
  name: string;
  gender: string;
  age: number;
  profile_picture: string;
  date_of_birth: string;
  phone_number: string;
  emergency_contact: string;
  insurance_type: string;
}

interface IPatientProfileData {
  name: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emergencyContact: string;
  insuranceType: string;
  profilePicture: string;
}

export const PatientProfile = () => {
  const [patient, setPatient] = useState<IPatientProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const patients = await fetchPatients();
        if (patients.length >= 3) {
          const apiPatient = patients[3] as IPatientFromApi;
          
          const patientData: IPatientProfileData = {
            name: apiPatient.name,
            dateOfBirth: apiPatient.date_of_birth,
            gender: apiPatient.gender,
            phoneNumber: apiPatient.phone_number,
            emergencyContact: apiPatient.emergency_contact,
            insuranceType: apiPatient.insurance_type,
            profilePicture: apiPatient.profile_picture
          };
          
          setPatient(patientData);
        } else {
          setError("Not enough patients in the database");
        }
      } catch (err) {
        setError("Failed to load patient data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading patient data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8 text-center">{error}</div>;
  }

  if (!patient) {
    return <div className="p-8 text-center">No patient data available</div>;
  }

  return (
    <div className="max-w-[367px] w-full max-h-[740px] bg-white flex py-[32px] flex-col gap-8 p-8 rounded-[16px] shadow-md">
  <div className="flex flex-col items-center gap-4">
    <img
      src={patient.profilePicture}
      alt={patient.name}
      className="w-[150px] h-[150px] rounded-full object-cover mx-auto"
    />
    <h3 className="text-[24px] font-semibold text-center">{patient.name}</h3>
  </div>

  <ul className="flex flex-col gap-6">
    <ProfileItem
      icon={birthIcon}
      label="Date of birth"
      value={patient.dateOfBirth}
      alt="Birth icon"
    />
    <ProfileItem
      icon={femaleIcon}
      label="Gender"
      value={patient.gender}
      alt="Gender icon"
    />
    <ProfileItem
      icon={phoneIcon}
      label="Contact"
      value={patient.phoneNumber}
      alt="Phone icon"
    />
    <ProfileItem
      icon={phoneIcon}
      label="Emergency contact"
      value={patient.emergencyContact}
      alt="Emergency phone icon"
    />
    <ProfileItem
      icon={insuranceIcon}
      label="Insurance"
      value={patient.insuranceType}
      alt="Insurance icon"
    />
  </ul>

  <div className="flex justify-center">
    <button className="w-[220px] h-[41px] mt-[40px] bg-[#01F0D0] py-3 rounded-[41px] flex items-center justify-center text-[#072635] font-bold text-[14px] cursor-pointer">
      Show All information
    </button>
  </div>
</div>
  );
};

interface IProfileItemProps {
  icon: string;
  label: string;
  value: string;
  alt: string;
}

const ProfileItem = ({ icon, label, value, alt }: IProfileItemProps) => (
  <li className="flex items-start gap-4">
    <img src={icon} alt={alt} className="w-[42px] h-[42px] mt-0.5 flex-shrink-0" />
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  </li>
);