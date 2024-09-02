import { Link } from 'react-router-dom'

const Home = () => {

    return (
        <div>
          <header>
            <img className='logo-black' src="logo-black.png"/>
            <nav>
                
                <ul className="navlinks">
                  
                  <li><a>About</a></li>
                  <li><a>Tutorial</a></li>
                  <li><a>Updates</a></li>
                  <li><a><button>Get Started</button></a></li>
                </ul>
            </nav>
            
          </header>


      <div className='title-section'>
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

      <div className='about-section'>
        <div className='heading'>
          <p>Why CoLabel?</p>
        </div>
        <div className='about-blocks'>
          <div className='row row-1'>
            <div className='block block-1'>
              <p className='subheading'>A seamless experience</p>
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
        </div>
    )
}


export default Home;