import {Component} from 'react'
import './App.css'
import {FaFilter} from 'react-icons/fa'

class App extends Component {
  state = {
    candidates: [],
    searchQuery: '',
    filter: {gender: '', experience: '', skills: []},
    currentPage: 1,
    candidatesPerPage: 10,
    showFilter: false,
    newCandidate: {
      name: '',
      phone: '',
      email: '',
      gender: '',
      experience: '',
      skills: '',
    },
  }

  componentDidMount() {
    this.fetchCandidates()
  }

  fetchCandidates = async () => {
    try {
      const response = await fetch('http://localhost:3000/candidatesGet')
      const data = await response.json()
      this.setState({candidates: data})
    } catch (error) {
      console.error('Error fetching candidates:', error)
    }
  }

  handleSearch = e => {
    this.setState({searchQuery: e.target.value})
  }

  handleFilterChange = (field, value) => {
    this.setState(prevState => ({
      filter: {
        ...prevState.filter,
        [field]: field === 'skills' ? value.map(skill => skill.toLowerCase().trim()) : value.toLowerCase().trim(),
      },
    }))
  }

  handlePageChange = page => {
    this.setState({currentPage: page})
  }

  handleInputChange = e => {
    const {name, value} = e.target
    this.setState(prevState => ({
      newCandidate: {...prevState.newCandidate, [name]: value},
    }))
  }

  handleSubmit = async () => {
    const{newCandidate} = this.state
    console.log(newCandidate)
    try {
      const response = await fetch('http://localhost:3000/candidates', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newCandidate),
      })
      if (response.ok) {
        this.fetchCandidates()
        this.setState({
          newCandidate: {
            name: '',
            phone: '',
            email: '',
            gender: '',
            experience: '',
            skills: '',
          },
        })
      }
    } catch (error) {
      console.error('Error adding candidate:', error)
    }
  }

  render() {
    const {candidates, searchQuery, filter, currentPage, candidatesPerPage, showFilter, newCandidate} = this.state

    const filteredCandidates = candidates.filter(candidate => {
      const skillsArray = candidate.skills.toLowerCase().split(',').map(skill => skill.trim())
      return (
        (candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.phone.includes(searchQuery) ||
          candidate.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!filter.gender || candidate.gender.toLowerCase() === filter.gender) &&
        (!filter.experience || candidate.experience.toLowerCase() === filter.experience) &&
        (!filter.skills.length || filter.skills.every(skill => skillsArray.includes(skill)))
      )
    })

    const indexOfLastCandidate = currentPage * candidatesPerPage
    const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage
    const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate)

    return (
      <div className="container">
        <h2>Candidate Management</h2>
        <div className="top-bar">
          <input type="text" placeholder="Search by name, phone, or email..." onChange={this.handleSearch} />
          <button type="button" onClick={() => this.setState({showFilter: !showFilter})} className="filter-button">
            <FaFilter />
          </button>
        </div>
        {showFilter && (
          <div className="filter-section">
            <select onChange={e => this.handleFilterChange('gender', e.target.value)}>
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select onChange={e => this.handleFilterChange('experience', e.target.value)}>
              <option value="">All Experience</option>
              <option value="1 year">1 Year</option>
              <option value="2 years">2 Years</option>
              <option value="3 years">3 Years</option>
            </select>
            <input type="text" placeholder="Filter by skills (comma separated)" onChange={e => this.handleFilterChange('skills', e.target.value.split(','))} />
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Experience</th>
              <th>Skills</th>
            </tr>
          </thead>
          <tbody>
            {currentCandidates.map(candidate => (
              <tr key={candidate.id} className="hover-row">
                <td>{candidate.name}</td>
                <td>{candidate.phone}</td>
                <td>{candidate.email}</td>
                <td>{candidate.gender}</td>
                <td>{candidate.experience}</td>
                <td>{candidate.skills}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="add-candidate-form">
          <h3>Add Candidate</h3>
          <input type="text" name="name" placeholder="Name" value={newCandidate.name} onChange={this.handleInputChange} />
          <input type="text" name="phone" placeholder="Phone" value={newCandidate.phone} onChange={this.handleInputChange} />
          <input type="email" name="email" placeholder="Email" value={newCandidate.email} onChange={this.handleInputChange} />
          <select
              name="gender"
              onChange={this.handleInputChange}
              value={newCandidate.gender}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select
              name="experience"
              onChange={this.handleInputChange}
              value={newCandidate.experience}
            >
              <option value="">Select Experience</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="3 Years">3 Years</option>
            </select>
          <input type="text" name="skills" placeholder="Skills (comma separated)" value={newCandidate.skills} onChange={this.handleInputChange} />
          <button type="button" onClick={this.handleSubmit}>Submit</button>
        </div>
      </div>
    )
  }
}

export default App;
