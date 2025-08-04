export interface DiagnosisHistory {
  diagnosis: string;
  date: string;
  month: string;
  year: number;
  blood_pressure: {
    systolic: {
      value: number;
      levels: string;
    };
    diastolic: {
      value: number;
      levels: string;
    };
  };
  respiratory_rate: {
    value: number;
    levels: string;
  };
  heart_rate: {
    value: number;
    levels: string;
  };
  temperature: {
    value: number;
    levels: string;
  };
}

export interface MedicalProblem {
  name: string;
  description: string;
  status: string;
}

export interface Patient {
  name: string;
  gender: string;
  age: number;
  date_of_birth: string;
  profile_picture?: string;
  diagnosis_history?: DiagnosisHistory[];
  lab_results?: string[];
  insurance_type?: string;
  diagnostic_list?: MedicalProblem[];
}

export const fetchPatients = async (): Promise<Patient[]> => {
  try {
    const authString = btoa("coalition:skills-test");
    const response = await fetch(
      "https://fedskillstest.coalitiontechnologies.workers.dev",
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as unknown;

    if (!data) throw new Error("Empty response from server");

    let patients: unknown[] = [];
    if (Array.isArray(data)) {
      patients = data;
    } else if (
      typeof data === "object" &&
      data !== null &&
      "patients" in data
    ) {
      patients = Array.isArray(data.patients) ? data.patients : [data.patients];
    } else {
      patients = [data];
    }

    patients.forEach((patient) => {
      if (typeof patient !== "object" || patient === null) {
        throw new Error("Invalid patient data structure");
      }
      if (!("name" in patient) || !("age" in patient)) {
        throw new Error("Patient data missing required fields");
      }
    });

    return patients as Patient[];
  } catch (err) {
    console.error("Error fetching patients:", err);
    throw err;
  }
};
