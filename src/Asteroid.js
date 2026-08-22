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
    this.onHealthChange = args.onHealthChange || null
    this.color = args.color || '#c8a45d'
    this.delete = false
    this.score = args.score || 100
    this.impulse = { x: 0, y: 0 }
    this.impulseDamping = args.gametype === 'Boss' ? 0.985 : 0.94
    this.impacts = []


  }

  deformMeshAt (hitPosition) {
    const dx = hitPosition.x - this.position.x
    const dy = hitPosition.y - this.position.y
    const cos = Math.cos(-this.rotation * Math.PI / 180)
    const sin = Math.sin(-this.rotation * Math.PI / 180)
    const localHit = {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos
    }
    const craterRadius = 52

    // Pull the nearby surface vertices toward the impact. This changes the
    // asteroid's actual polygon mesh instead of painting over it.
    this.vertices = this.vertices.map((vertex) => {
      const distance = Math.hypot(vertex.x - localHit.x, vertex.y - localHit.y)
      if (distance > craterRadius * 1.45) return vertex
      const strength = Math.max(0, 1 - distance / (craterRadius * 1.45)) * 0.72
      return {
        x: vertex.x + (localHit.x - vertex.x) * strength,
        y: vertex.y + (localHit.y - vertex.y) * strength
      }
    })

    const points = 12
    const contour = Array.from({ length: points }, (_, index) => {
      const angle = (index / points) * Math.PI * 2
      const variation = 0.78 + (((this.impacts.length * 7 + index * 13) % 7) / 20)
      return {
        x: localHit.x + Math.cos(angle) * craterRadius * variation,
        y: localHit.y + Math.sin(angle) * craterRadius * variation
      }
    })
    this.impacts.push(contour)
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
      numberofrocks = 1
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
  destroy (hitPosition, damage = 15) {
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

    // decrease boss health
    if (this.gametype === 'Boss') {
      const shrinkPower = Math.max(10, Math.min(22, damage))
      const size = this.radius - shrinkPower
      if (hitPosition) {
        this.deformMeshAt(hitPosition)
      }
      const health = Math.min(100, Math.max(0, ((size - 15) / (this.initialRadius - 15)) * 100))
      if (this.onHealthChange) this.onHealthChange(health)

      if (size > 15) {
        this.radius = size
        // redraw asteroid
        this.vertices = asteroidVertices(size / 16 * 8, size)
      this.color = '#7f1d2d' //hitcolor
      setTimeout(() => {
        this.color = '#c8a45d'
        }, 200)
      } else {
        this.delete = true
        // trigger win condition
        this.onDie(true)
        return
      }
    }
    this.split(hitPosition)
  }
  render (state) {
    // Move
    this.velocity.x += this.impulse.x
    this.velocity.y += this.impulse.y
    this.impulse.x *= this.impulseDamping
    this.impulse.y *= this.impulseDamping
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

    if (this.gametype === 'Boss' && this.impacts.length > 0) {
      // The asteroid and every crater are one compound mesh. The even-odd
      // fill rule removes the crater contours from the rock rather than
      // drawing a circle on top of its surface.
      this.impacts.forEach((contour) => {
        context.moveTo(contour[0].x, contour[0].y)
        for (let i = 1; i < contour.length; i++) {
          context.lineTo(contour[i].x, contour[i].y)
        }
        context.closePath()
      })
      context.fillStyle = '#08050a'
      context.fill('evenodd')
    }

    context.strokeStyle = this.color
    context.stroke()
    if (this.gametype === 'Boss') {
      context.strokeStyle = '#7f1d2d'
      this.impacts.forEach((contour) => {
        context.beginPath()
        context.moveTo(contour[0].x, contour[0].y)
        for (let i = 1; i < contour.length; i++) {
          context.lineTo(contour[i].x, contour[i].y)
        }
        context.closePath()
        context.stroke()
      })
    }
    context.restore()
  }
}
