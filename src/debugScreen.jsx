import React from 'react'

export default class DebugScreen extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
        open: {
            asteroidDrawer: false,
            bulletsDrawer: false
        }
    }
  }
  toggleOpen(comp){
    let currentlyOpen = this.state.open
    currentlyOpen[comp] = !currentlyOpen[comp]
    this.setState({
        open: currentlyOpen
    })

  }
  render(){
    return (
        <section className="debugScreen">
            { this.props.asteroids &&
              <button onClick={() => this.toggleOpen('asteroidDrawer')}>Asteroids: {this.props.asteroids.length}</button>
            }
            { this.state.open.asteroidDrawer &&
              this.props.asteroids.map((asteroid, i) => <p key={`Asteroid${i}`}>{asteroid.gametype}#{asteroid.stage}: x{Math.round(asteroid.position.x)} y{Math.round(asteroid.position.y)}</p>)
            }

            <button onClick={() => this.toggleOpen('bulletsDrawer')}>Bullets: {this.props.bullets.length}</button>
            {this.state.open.bulletsDrawer &&
                this.props.bullets.map((bullet, i) => <p key={`Bullet${i}`}>{bullet.name}: x{Math.round(bullet.position.x)} y{Math.round(bullet.position.y)}</p>)
            }
        </section>
      )

  }
}
