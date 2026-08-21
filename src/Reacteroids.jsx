import React, { Component } from 'react'
import Ship from './Ship'
import Asteroid from './Asteroid'
import { randomNumBetweenExcluding } from './helpers'
import hitReg from './hitReg'

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
  S: 83,
  DOWN: 40
}

export class Reacteroids extends Component {
  constructor () {
    super()
    this.state = {
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1
      },
      context: null,
      keys: {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
        space: 0
      },
      currentScore: 0,
      topScore: localStorage['topscore'] || 0,
      bossHealth: 100,
      combatStarted: false,
      inGame: false,
      gameWon: false,
      asteroids: []
    }
    this.ship = []
    this.asteroids = []
    this.bullets = []
    this.particles = []
    this.frameState = { screen: this.state.screen, keys: this.state.keys, context: null }
    this.animationFrame = null
    this.running = false
  }

  handleResize (value, e) {
    const screen = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio || 1
    }
    this.frameState.screen = screen
    this.setState({
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1
      }
    })
  }

  handleKeys (value, e) {
    const keys = this.frameState.keys
    if (e.keyCode === KEY.DOWN || e.keyCode === KEY.S) keys.down = value
    if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value
    if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value
    if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value
    if (e.keyCode === KEY.SPACE) keys.space = value
    this.frameState.keys = keys
  }

  componentDidMount () {
    this.boundKeyUp = this.handleKeys.bind(this, false)
    this.boundKeyDown = this.handleKeys.bind(this, true)
    this.boundResize = this.handleResize.bind(this, false)
    window.addEventListener('keyup', this.boundKeyUp)
    window.addEventListener('keydown', this.boundKeyDown)
    window.addEventListener('resize', this.boundResize)

    const context = this.canvas.getContext('2d')
    this.frameState.context = context
    this.running = true
    this.animationFrame = requestAnimationFrame(this.update)
  }

  componentWillUnmount () {
    this.running = false
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame)
    window.removeEventListener('keyup', this.boundKeyUp)
    window.removeEventListener('keydown', this.boundKeyDown)
    window.removeEventListener('resize', this.boundResize)
  }

  update = () => {
    if (!this.running) return
    const frameState = this.frameState
    const context = frameState.context

    context.save()
    context.scale(frameState.screen.ratio, frameState.screen.ratio)

    // Motion trail
    context.fillStyle = '#08050a' // BAROQUE NIGHT BACKDROP
    context.globalAlpha = 0.4
    context.fillRect(0, 0, frameState.screen.width, frameState.screen.height)
    context.globalAlpha = 1

    // Check for colisions
    this.checkCollisionsWith(this.bullets, this.asteroids)
    this.checkCollisionsWith(this.ship, this.asteroids)

    // Remove or render
    this.updateObjects(this.particles, 'particles')
    this.updateObjects(this.asteroids, 'asteroids')
    this.updateObjects(this.bullets, 'bullets')
    this.updateObjects(this.ship, 'ship')

    context.restore()

    this.animationFrame = requestAnimationFrame(this.update)
  }

  addScore (points) {
    if (this.state.inGame) {
      this.setState({
        currentScore: this.state.currentScore + points,
        combatStarted: true
      })
    }
  }

  updateBossHealth (health) {
    if (this.state.inGame) {
      this.setState({
        bossHealth: Math.max(0, Math.round(health)),
        combatStarted: true
      })
    }
  }

  startGame () {
    this.setState({
      inGame: true,
      gameWon: false,
      currentScore: 0,
      bossHealth: 100,
      combatStarted: false,
    })

    // Make ship

    let ship = new Ship({
      position: {
        x: randomNumBetweenExcluding(0, this.state.screen.width, this.state.screen.width / 2 - 160, this.state.screen.width / 2 + 160),
        y: randomNumBetweenExcluding(0, this.state.screen.height, this.state.screen.height / 2 - 160, this.state.screen.height / 2 + 160)
      },
      create: this.createObject.bind(this),
      onDie: this.gameOver.bind(this)
    }, this)
    this.createObject(ship, 'ship')

    // Make asteroids
    this.asteroids = []
    // this.generateAsteroids(this.state.asteroidCount)
    this.boss = this.startBoss()
  }

  startBoss(){
    // let them be summoned from the depths of hell
    this.generateAsteroid()

    // setTimeout(() => {
    //   boss.radius = 100
    //   boss.vertices = asteroidVertices(boss.radius / 16 * 8, boss.radius)
    // }, 100)
  }

  gameOver (gameState) {
    if(this.state.inGame) {
      this.setState({
        inGame: false,
        gameWon: gameState || false
      })
      // Replace top score
      if ( this.state.currentScore > this.state.topScore ) {
        this.setState({
          topScore: this.state.currentScore
        })
        localStorage['topscore'] = this.state.currentScore
      }
    }
  }
/*
  generateAsteroids (howMany) {
    let asteroids = []
    let ship = this.ship[0]
    for (let i = 0; i < howMany; i++) {
      let asteroid = new Asteroid({
        size: 500,
        position: {
          x: randomNumBetweenExcluding(0, this.state.screen.width, ship.position.x - 60, ship.position.x + 60),
          y: randomNumBetweenExcluding(0, this.state.screen.height, ship.position.y - 60, ship.position.y + 60)
        },
        create: this.createObject.bind(this),
        addScore: this.addScore.bind(this)
      })
      this.createObject(asteroid, 'asteroids')
    }
  }
*/
  generateAsteroid () {
    let asteroid = new Asteroid({
      size: 200,
      velocity: {
        x: 0,
        y: 0
      },
      position: {
        x: this.state.screen.width / 2,
        y: this.state.screen.height / 2
      },
      create: this.createObject.bind(this),
      addScore: this.addScore.bind(this),
      onHealthChange: this.updateBossHealth.bind(this),
      gametype: 'Boss',
      onDie: this.gameOver.bind(this)
    })
    this.createObject(asteroid, 'asteroids')
    return asteroid
  }

  createObject (item, group) {
    this[group].push(item)
  }

  updateObjects (items, group) {
    for (let index = items.length - 1; index >= 0; index--) {
      const item = items[index]
      if (item.delete) {
        items.splice(index, 1)
      } else {
        item.render(this.frameState)
      }
    }
  }

  checkCollisionsWith (items1, items2) {
    var a = items1.length - 1
    var b
    for (a; a > -1; --a) {
      b = items2.length - 1
      for (b; b > -1; --b) {
        var item1 = items1[a]
        var item2 = items2[b]
        if (this.checkCollision(item1, item2)) {
          const bulletpos = new hitReg(item1, item2, {create: this.createObject.bind(this),
            addScore: this.addScore.bind(this)}).default()
          item1.destroy() // kill bullet
          item2.destroy(bulletpos) // kill asteroid
        }
      }
    }
  }

  checkCollision (obj1, obj2) {
    var vx = obj1.position.x - obj2.position.x
    var vy = obj1.position.y - obj2.position.y
    var length = Math.sqrt(vx * vx + vy * vy)
    if (length < obj1.radius + obj2.radius) {
      return true
    }
    return false
  }

  render () {
    let endgame
    let message

    if (this.state.currentScore <= 0) {
      message = '0 points...'
    } else if (this.state.currentScore >= this.state.topScore) {
      message = 'Top score with ' + this.state.currentScore + ' points. Woo!'
    } else {
      message = this.state.currentScore + ' points.'
    }

    if (!this.state.inGame && !this.state.gameWon && this.state.currentScore === 0) {
      endgame = (
        <main className='start-screen'>
          <div className='scanline' aria-hidden='true' />
          <div className='start-panel'>
            <p className='eyebrow'><a href='https://github.com/CerxMe/Asteroid' target='_blank' rel='noopener noreferrer'>A CERXME ORIGINAL // OPEN-SOURCE GAME</a></p>
            <h1>ONE<br /><span>ASTEROID</span></h1>
            <p className='tagline'>A tiny mission born from a stroke of inspiration.</p>
            <div className='mission-copy'>
              <p>This is an Asteroids game, but there is only one asteroid.</p>
              <p>Destroy it while avoiding the debris, while flying your rocket in space.</p>
            </div>
            <div className='rules-grid'>
              <div><strong>A / D</strong><span>STEER</span></div>
              <div><strong>W</strong><span>THRUST</span></div>
              <div><strong>S</strong><span>HALT</span></div>
              <div><strong>SPACE</strong><span>FIRE</span></div>
            </div>
            <button className='start-button' onClick={this.startGame.bind(this)}>
              <span>INSERT COIN</span><b>START MISSION</b>
            </button>
            <p className='start-hint'>ARROW KEYS ALSO SUPPORTED</p>
          </div>
        </main>
      )
    } else if (!this.state.inGame) {
      endgame = (
        <main className={'endgame ' + (this.state.gameWon ? 'victory-screen' : 'defeat-screen')}>
          <div className='endgame-grid' aria-hidden='true' />
          <div className='endgame-panel'>
            <p className='endgame-kicker'>{this.state.gameWon ? 'MISSION STATUS // COMPLETE' : 'MISSION STATUS // CRITICAL'}</p>
            <h2>{this.state.gameWon ? 'ASTEROID\nDOWN' : 'SHIP\nLOST'}</h2>
            <div className='endgame-rule' />
            <p className='endgame-score'>{message}</p>
            <p className='endgame-copy'>{this.state.gameWon ? 'The last rock has been reduced to stardust.' : 'The debris field claimed your rocket. The void is still waiting.'}</p>
            <button className='relaunch-button' onClick={this.startGame.bind(this)}>
              <span>{this.state.gameWon ? 'LAUNCH AGAIN' : 'RE-ENTER THE VOID'}</span>
              <b>▶</b>
            </button>
          </div>
        </main>
      )
    }


//        <DebugScreen asteroids={this.asteroids} bullets={this.bullets}/>
    return (
      <div>
        { endgame }
        {this.state.inGame && this.state.combatStarted && (
          <span className='score current-score'>Score: {this.state.currentScore}</span>
        )}
        {this.state.inGame && this.state.combatStarted && (
          <div className='boss-health' aria-label={'Boss health ' + this.state.bossHealth + ' percent'}>
            <div className='boss-health-header'><span>BOSS VITALS</span><strong>{this.state.bossHealth}%</strong></div>
            <div className='boss-health-track'><div className='boss-health-fill' style={{ width: this.state.bossHealth + '%' }} /></div>
          </div>
        )}
        <span className='controls' >
          Use [A][W][D] or [←][↑][→] to MOVE <br />
          Use [S] or [↓] to HALT<br />
          Use [SPACE] to SHOOT
        </span>

        <canvas ref={(canvas) => { this.canvas = canvas }}
          width={this.state.screen.width * this.state.screen.ratio}
          height={this.state.screen.height * this.state.screen.ratio}
        />
      </div>
    )
  }
}
