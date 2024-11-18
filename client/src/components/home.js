import { Link } from 'react-router-dom'
import { Button, ButtonGroup } from '@mui/material';

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
            <p>Expedite the <span className='highlight'>boring</span>, <span className='highlight'>agonizing</span> part of developing AI models</p>
          </div>
          <div className=''>
            <Link to={"/dashboard"}><Button variant='outlined' size="large" sx={{ color: "#c6b3f5", borderColor: "#c6b3f5" }}>Get Started</Button></Link>
          </div>
        </div>
        <div className='right'>
          <div className='square-1'></div>
          <div className='square-2'></div>
          <div className='square-3'></div>
        </div>
      </div>

      <div className='about-section' id='about'>
        <div className='heading'>
          <p>Why <span className='highlight'>CoLabel</span>?</p>
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
          <p className='tutorial-text'>Here, you can add, delete, access, manage, and check the progress of your projects:</p>
          <div className='dashboard'>

          <div className='file-table'>
          <div className='file-rows'>

            <div className='column'>
              <h2 className="text-[25px] font-light">File</h2>
                <p>
                  <button className='bg-transparent border-none p-0 text-black focus:outline-none focus:ring-0 text-[15px]'>🗑️</button> 
                  <button className="bg-transparent border-none p-0 text-black focus:outline-none focus:ring-0">📥</button> 
                  fruits-dataset.csv
                </p>
                <p>
                  <button className='bg-transparent border-none p-0 text-black focus:outline-none focus:ring-0 text-[15px]'>🗑️</button> 
                  <button className="bg-transparent border-none p-0 text-black focus:outline-none focus:ring-0">📥</button> 
                  students.csv
                </p>
                <p>
                  <button className='bg-transparent border-none p-0 text-black focus:outline-none focus:ring-0 text-[15px]'>🗑️</button> 
                  <button className="bg-transparent border-none p-0 text-black focus:outline-none focus:ring-0">📥</button> 
                  cars.csv
                </p>
                
            </div>

            
            <div className='column'>
            <h2 className="text-[25px] font-light">Label Progress</h2>
              <p>21%</p>
              <p>54%</p>
              <p>100%</p>
            </div>


          </div>

          </div>
      </div>
          <p className='warning'>Ensure you have uploaded a .csv file as your unlabelled dataset!</p>
          <p className='warning'>Ensure your file is comma-seperated, NOT semicolon seperated!</p>
          <p className='warning'>Ensure your file does NOT yet contain the field you would like to add labelled data for, CoLabel will handle this for you!</p>
          <p className='tutorial-text'>Once you have opened a project for the first time, you will be prompted to set certain parameters:</p>
          <ul>
            <li><span className='blt-hdg'>Labels</span>: All possible labels you would like to give your new field. For example, if the new field was "gender", possible labels would be <span className='focus'>male</span> and <span className='focus'>female</span>.</li>
            <li><span className='blt-hdg'>Label Field Name</span>: The name of the new column you would like to add. According to the previous example, this would be <span className='focus'>gender</span>. </li>
            <li><span className='blt-hdg'>Fields To Label Upon</span>: For bigger datasets, looking at an entire row when deciding how to label a field can be redundant. This option allows you to pick which columns from your dataset you would like to see when deciding what label to choose. For our previous example, this could be <span className='focus'>name</span> as that is usually sufficient to decide gender.</li>
          </ul>
          <p className='tutorial-text'>After setting up your project, you will be asked to determine Chunk Size before each labelling session:</p>
          <ul>
            <li><span className='blt-hdg'>Chunk Size</span> determines the number of rows from your dataset you would like to label in this particular session. If your dataset contains 800 entries but you only have time to label 50 entries, you may set your chunk size to 50, and only 50 entries will be shown for labelling on that particular session.</li>
          </ul>
        </div>
      </div>
        </div>
    )
}


export default Home;