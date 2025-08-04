import { HeaderView } from './components/Header/HeaderView'
import { LeftSidePatients } from './components/Main/LeftSidePatients'
import { BloodPressureChart } from '../src/components/Main/BloodPressureDiagram'
import {PatientProfile} from '../src/components/Main/PatientProfile'
import {ProblemsTable} from '../src/components/Main/DiagnosticList'
import { LabResults } from '../src/components/Main/LabResults'


export const App = () => {
  return (
    <div className='bg-gray-100 px-[calc(50%-782px)]'>
    <header><HeaderView /></header>
    <main className='flex gap-[32px]  mt-10'><LeftSidePatients /><BloodPressureChart /><PatientProfile /></main><article className='flex justify-center mt-10'><ProblemsTable /><LabResults />  </article>
    </div>

  )
}

