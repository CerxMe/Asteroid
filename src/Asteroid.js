import Particle from './Particle'
import { asteroidVertices, randomNumBetween } from './helpers'

export default class Asteroid {
  constructor (args) {
    this.position = args.position
  /*  this.velocity = {
      x: randomNumBetween(-1.5, 1.5),
      y: randomNumBetween(-1.5, 1.5)
    } */
    this.velocity = args.velocity
    this.rotation = 0
    this.rotationSpeed = randomNumBetween(-0.4, 0.4)
    this.radius = args.size
    this.initialRadius = args.size
    this.create = args.create
    this.addScore = args.addScore
    this.onDie = args.onDie || null
    this.vertices = args.vertices || asteroidVertices(args.size / 16 * 8, args.size)
    this.gametype = args.gametype
    this.name = 'Asteroid'
    this.stage = args.stage || 4
    this.maxHealth = args.maxHealth || (args.gametype === 'Boss' ? 100 : 1)
    this.initialHealth = this.maxHealth
    this.onHealthChange = args.onHealthChange || null
    this.color = args.color || '#c8a45d'
    this.delete = false
    this.score = args.score || 100
    this.craters = []
    this.damagePerHit = args.damagePerHit || (this.gametype === 'Boss' ? 15 : 1)
    this.mass = Math.max(1, this.radius * this.radius)


  }
  /* constructor (args) {
    this.asteroid = args
    this.asteroid.velocity = { x: 0, y: 0 }
    this.asteroid.rotation = 0
    this.asteroid.rotationSpeed = randomNumBetween(-0.5, 0.5)
    this.asteroid.radius = args.size
    this.asteroid.score = (1000 / this.radius) * 5
    this.asteroid.create = args.create
    this.asteroid.addScore = args.addScore
    this.asteroid.vertices = asteroidVertices(args.size/16*8, args.size)
  } */
  getRandomColor() {
    // https://www.schemecolor.com/rainbow-pastels-color-scheme.php
    const rainbow = [
      '#FF9AA2', // Light Salmon Pink
      '#FFB7B2', // Melon
      '#FFDAC1', // Very Pale Orange
      '#E2F0CB', // Dirty White
      '#B5EAD7', //  Magic Mint
      '#C7CEEA', // Crayola's Periwinkle
    ]
    return rainbow[Math.floor((Math.random()*rainbow.length))]
  }
  split (spawnLocation) { // split 3 times from big boy
    // spawn a big lump of rocks when you hit the boss

    let newSize, numberofrocks, summonedStage, vertices, score
    if (this.gametype === 'Boss') {
      newSize = randomNumBetween(100, 120)
      numberofrocks = randomNumBetween(1, 2)
      summonedStage = 2
      vertices = asteroidVertices(32, newSize)
      score = 10

    } else {
      spawnLocation = null // split from the middle when shooting smaller asteroids
      switch (Math.floor(this.stage)) {
        case 2:
          newSize = randomNumBetween(55, 80)
          numberofrocks = randomNumBetween(1, 2)
          summonedStage = 1
          vertices = asteroidVertices(randomNumBetween(13, 20), newSize)
          score = 20
          break
        case 1:
          newSize = randomNumBetween(9, 25)
          numberofrocks = randomNumBetween(1, 2)
          vertices = asteroidVertices(randomNumBetween(4, 7), newSize)
          summonedStage = 0
          score = 50
          break
        default:
          numberofrocks = 0
          return
      }
    }


    // summon thee
    for ( let i = 0; i < numberofrocks; i++ ) {
      let asteroid = new Asteroid({
        velocity: {
          x: randomNumBetween(-1.9, 1.9),
          y: randomNumBetween(-1.9, 1.9)
        },
        size: newSize > 50 ? newSize : 10,
        position: {
          x: (spawnLocation?.x || this.position.x) + randomNumBetween(-10, 20),
          y: (spawnLocation?.y || this.position.y) + randomNumBetween(-10, 20)
        },
        maxHealth: newSize > 50 ? this.maxHealth : 1,
        create: this.create.bind(this),
        addScore: this.addScore.bind(this),
        stage: summonedStage,
        vertices: vertices || null,
        color: this.getRandomColor(),
        score: score,
        gametype: 'Debree'
      })
      this.create(asteroid, 'asteroids')
    }

  }
  destroy (hitPosition) {
    if (this.delete) return

    const impact = hitPosition || this.position
    const dx = this.position.x - impact.x
    const dy = this.position.y - impact.y
    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy))
    const normalX = dx / distance
    const normalY = dy / distance
    const blastRadius = Math.max(24, Math.min(this.radius * 0.42, 92))
    const falloff = Math.max(0.18, 1 - Math.min(distance, blastRadius) / blastRadius)
    const impactAngle = Math.atan2(impact.y - this.position.y, impact.x - this.position.x)
    const impulse = Math.max(0.2, falloff * 2.4)
    this.velocity.x += normalX * impulse
    this.velocity.y += normalY * impulse
    this.craters.push({
      x: impact.x - this.position.x,
      y: impact.y - this.position.y,
      radius: Math.min(42, Math.max(10, blastRadius * (0.34 + falloff * 0.3))),
      rotation: impactAngle
    })
    if (this.craters.length > 8) this.craters.shift()

    this.addScore(this.score)
    // Explode
    for (let i = 0; i < 30; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 4),
        position: {
          x: this.position.x + randomNumBetween(-this.radius / 2 , this.radius / 2),
          y: this.position.y + randomNumBetween(-this.radius / 2 , this.radius / 2)
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        },
        color: this.color
      })
      this.create(particle, 'particles')
    }

    // kill enemy
    if(this.gametype === 'Debree'){
      this.delete = true
    }

    // Apply finite durability with radial blast falloff. Hits near the core do more damage.
    if (this.gametype === 'Boss') {
      this.maxHealth = this.maxHealth || 100
      const damage = Math.max(1, Math.round(this.damagePerHit * (0.55 + falloff * 1.45)))
      this.maxHealth -= damage
      const health = Math.min(100, Math.max(0, (this.maxHealth / this.initialHealth) * 100))
      if (this.onHealthChange) this.onHealthChange(health)
      this.color = '#7f1d2d'
      clearTimeout(this.hitFlashTimer)
      this.hitFlashTimer = setTimeout(() => { this.color = '#c8a45d' }, 160)
      if (this.maxHealth <= 0) {
        this.delete = true
        this.onDie(true)
        return
      }
    } else {
      this.delete = true
    }
    this.split(hitPosition)
  }
  render (state) {
    // Move
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // Rotation
    this.rotation += this.rotationSpeed
    if (this.rotation >= 360) {
      this.rotation -= 360
    }
    if (this.rotation < 0) {
      this.rotation += 360
    }

    // Screen edges
    if (this.position.x > state.screen.width + this.radius) this.position.x = -this.radius
    else if (this.position.x < -this.radius) this.position.x = state.screen.width + this.radius
    if (this.position.y > state.screen.height + this.radius) this.position.y = -this.radius
    else if (this.position.y < -this.radius) this.position.y = state.screen.height + this.radius

    // Draw
    const context = state.context
    context.save()
    context.translate(this.position.x, this.position.y)
    context.rotate(this.rotation * Math.PI / 180)
    context.strokeStyle = this.color
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(0, -this.radius)
    for (let i = 1; i < this.vertices.length; i++) {
      context.lineTo(this.vertices[i].x, this.vertices[i].y)
    }
    context.closePath()
    context.stroke()

    // Cut dark, irregular impact cavities into the rock surface.
    context.fillStyle = '#08050a'
    context.strokeStyle = '#7f1d2d'
    context.lineWidth = 1.5
    this.craters.forEach((crater) => {
      context.save()
      context.translate(crater.x, crater.y)
      context.rotate(crater.rotation)
      context.beginPath()
      context.ellipse(0, 0, crater.radius, crater.radius * 0.62, 0, 0, Math.PI * 2)
      context.fill()
      context.stroke()
      context.restore()
    })
    context.restore()
  }
}
