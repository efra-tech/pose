export const KEYWORDS = ['Portrait Photography', 'Wedding Photography', 'Event Photography', 'Senior Photos']
export const WHITE_KEYWORDS = ['Benson Polytechnic High School', 'Cleveland High School', 'Franklin High School', 'Grant High School', 'Jefferson High School', 'Lincoln High School', 'Leodis V. McDaniel High School', 'Roosevelt High School', 'Ida B. Wells-Barnett High School', 'Alliance High School', 'Metropolitan Learning Center', 'Riverdale High School', 'Parkrose High School', 'David Douglas High School', 'Centennial High School', 'Gresham High School', 'Sam Barlow High School', 'Springwater Trail High School', 'Reynolds High School', 'Reynolds Learning Academy', 'Corbett High School', 'Sandy High School', 'Beaverton High School', 'Aloha High School', 'Mountainside High School', 'Southridge High School', 'Sunset High School', 'Westview High School', 'Arts & Communication Magnet Academy', 'International School of Beaverton', 'Merlo Station High School', 'Community School', 'Century High School', 'Glencoe High School', 'Hillsboro High School', 'Liberty High School', 'Hillsboro Online Academy', 'Forest Grove High School', 'Tigard High School', 'Tualatin High School', 'Sherwood High School', 'Banks High School', 'Gaston High School', 'Lake Oswego High School', 'Lakeridge High School', 'West Linn High School', 'Wilsonville High School', 'Riverside High School', 'Oregon City High School', 'Clackamas High School', 'Adrienne C. Nelson High School', 'Milwaukie High School', 'Rex Putnam High School', 'New Urban High School', 'Gladstone High School', 'Canby High School', 'Molalla High School', 'Estacada High School', 'Colton High School', 'Columbia River High School', 'Fort Vancouver High School', "Hudson's Bay High School", 'Skyview High School', 'Vancouver School of Arts and Academics', 'Vancouver Flex Academy', 'Evergreen High School', 'Heritage High School', 'Mountain View High School', 'Union High School', 'Henrietta Lacks Health and Bioscience High School', 'Legacy High School', 'Battle Ground High School', 'Prairie High School', 'CAM Academy', 'River HomeLink', 'Camas High School', 'Hayes Freedom High School', 'Discovery High School', 'Washougal High School', 'Excelsior High School', 'Hockinson High School', 'Ridgefield High School', 'La Center High School', 'Seton Catholic College Preparatory High School', 'Scappoose High School', 'St. Helens High School', 'Newberg High School', 'Yamhill Carlton High School', 'Dayton High School', 'McMinnville High School', 'Amity High School', 'Sheridan High School', 'Vernonia High School', 'Jesuit High School', 'Valley Catholic High School', "St. Mary's Academy", 'Central Catholic High School', 'De La Salle North Catholic High School', 'Catlin Gabel School', 'Oregon Episcopal School', 'Portland Waldorf School', 'Northwest Academy', 'Portland Adventist Academy', 'Portland Christian High School', 'Columbia Christian School', 'Faith Bible Christian School', 'Life Christian School', 'Horizon Christian High School', 'Westside Christian High School', 'Southwest Christian School', 'Damascus Christian School', 'Country Christian School', 'Open Door Christian Academy', "King's Way Christian Schools", 'Columbia Adventist Academy', 'Portland Jewish Academy', 'The Delphian School', "St. Stephen's Academy", 'Valor Christian School International', 'Portland State University', 'University of Portland', 'Reed College', 'Lewis & Clark College', 'University of Oregon Portland', 'Oregon Health & Science University', 'Warner Pacific University', 'National University of Natural Medicine', 'Pacific Northwest College of Art', 'Western Seminary', 'University of Western States', 'Multnomah University', 'Oregon State University Portland Center', 'Portland Community College', 'Mt. Hood Community College', 'Clackamas Community College', 'Clark College', 'Washington State University Vancouver', 'George Fox University', 'Pacific University', 'Linfield University', 'Mount Angel Seminary', 'PCC Sylvania', 'PCC Cascade', 'PCC Rock Creek', 'PCC Southeast', 'PCC Willow Creek Center', 'Mt. Hood Community College Main Campus', 'Clackamas Community College Oregon City Campus', 'Clackamas Community College Harmony Campus', 'Clackamas Community College Wilsonville Campus', 'Clark College Main Campus', 'Clark College at Columbia Tech Center']

export function Logo() {
  return (
    <span className="logo" aria-label="Pose Photography">
      P
      <svg className="logo__lens" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <radialGradient id="lg" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffd2f4" />
            <stop offset=".25" stopColor="#2a1a8a" />
            <stop offset=".6" stopColor="#5b3dff" />
            <stop offset=".85" stopColor="#e64fc4" />
            <stop offset="1" stopColor="#1a0b35" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="31" fill="#0b0b0d" stroke="#3a3a42" strokeWidth="2" />
        <circle cx="32" cy="32" r="22" fill="url(#lg)" />
        <circle cx="32" cy="32" r="7" fill="#0a0420" />
        <circle cx="29" cy="29" r="2.5" fill="#fff" />
      </svg>
      SE
    </span>
  )
}
