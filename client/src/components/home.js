import { Link } from 'react-router-dom'

const Home = () => {

    return (
        <div>
          <header>
            <a href='#title'>
                <img className='logo-black' src="logo-black.png"/>
            </a>
            <nav>
                
                <ul className="navlinks">
                  
                  <li><a href='#about'>About</a></li>
                  <li><a href='#tutorial'>Tutorial</a></li>
                  <li><a href='#updates'>Updates</a></li>
                  <li><a><button style={{all: 'unset'}}>Get Started</button></a></li>
                </ul>
            </nav>
            
          </header>


      <div className='title-section' id='title'>
        <div className='left'>
          <div className='title'>
            <p></p>
          </div>
          <div className='subtitle'>
            <p>Collaborate on labelling training datasets</p>
          </div>
          <div className='description'>
            <p>Expedite the boring, agonizing part of developing AI models</p>
          </div>
          <div className='get-started'>
            <Link to={"/dashboard"}><button>Get Started</button></Link>
          </div>
        </div>
        <div className='right'>
          <div className='square-1'></div>
          <div className='square-2'></div>
          <div className='square-3'></div>
          <div className='square-4'></div>
        </div>
      </div>

      <div className='about-section' id='about'>
        <div className='heading'>
          <p>Why CoLabel?</p>
        </div>
        <div className='about-blocks'>
          <div className='row row-1'>
            <div className='block block-1'>
              <p className='subheading'>A Seamless Experience</p>
              <p className='description'>
                CoLabel offers an intuitive interface for labelling your datasets. Gone are the days of writing code to set up such environments!
              </p>
            </div>
            <div className='block-2 block '>
              <p className='subheading'>Unlabelled In, Labelled Out</p>
              <p className='description'>
                We will handle all the nasty work behind the scenes. Just upload your unlabelled .csv file, set a couple parameters, 
                and click away to label.
              </p>
            </div>
          </div>
          
          <div className='row-2 row'>
            <div className='block-3 block '>
              <p className='subheading'>Recieve A Helping Hand</p>
              <p className='description'>
                Multiply your workrate by assigning chunks of unlabelled fields to members of your team to help tackle larger datasets.
              </p>
            </div>
            <div className='block-4 block '>
              <p className='subheading'>Data Security</p>
              <p className='description'>
                Built with security and transparency at our core, and as an open-source platform, we offer full visibility into our code and practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='tutorial-section' id='tutorial'>
        <p className='heading'>Tutorial</p>
        <div className='tutorial-block'>
          <p className='tutorial-text'>After setting up your account, proceed to your dashboard where you will see your currently uploaded files.</p>
          <p className='tutorial-text'>Here, you can add, delete, access, and manage your projects.</p>
          <p className='warning'>Ensure you are uploaded a .csv file as your unlabelled dataset!</p>
          <p className='warning'>Ensure your file is comma-seperated, NOT semicolon seperated!</p>
          <p className='warning'>Ensure your file does NOT yet contain the field you would like to add labelled data for, CoLabel will handle this for you!</p>
          <p className='tutorial-text'>Once you have opened a project for the first time, you will be prompted to set certain parameters.</p>
        </div>
      </div>
        </div>
    )
}


export default Home;