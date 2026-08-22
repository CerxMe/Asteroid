import Particle from './Particle'
import { randomNumBetween } from './helpers'
import { Component } from 'react'

export default class hitReg extends Component {
  constructor (item1, item2, create) {
    super()
    this.game = create
    this.create = create.create
    this.addScore = create.addScore
    this.asteroids = create.asteroids || []
    this.item1 = item1
    this.item2 = item2
  }
  default () {
    if (this.item1.name === 'Bullet' && this.item2.name === 'Asteroid') {
      let bulletpos = this.item1.position

      // Hitreg explosion

      // stole from stackoverflow https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
      /* eslint-disable max-len */
      function shadeColor(color, percent) {

        let R = parseInt(color.substring(1,3),16);
        let G = parseInt(color.substring(3,5),16);
        let B = parseInt(color.substring(5,7),16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R<255)?R:255;
        G = (G<255)?G:255;
        B = (B<255)?B:255;

        const RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16));
        const GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16));
        const BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16));

        return "#"+RR+GG+BB;
      }
      /* eslint-disable max-len */

      // big explosion particles flying all over the place
      const particleSpeed = this.item2.radius / 16  // TODO proper sizes of explosions
      const darkerColor = shadeColor(this.item2.color || '#B287A3', -40)
      const lighterColor = shadeColor(this.item2.color || '#B287A3', 40)
      for (let i = 0; i < 22; i++) {
        const bigParticle = new Particle({
          lifeSpan: randomNumBetween(3, 10),
          size: randomNumBetween(6, 4),
          position: {
            x: bulletpos.x,
            y: bulletpos.y
          },
          velocity: {
            x: randomNumBetween((particleSpeed*4) * -1, particleSpeed*4),
            y: randomNumBetween((particleSpeed*4) * -1, particleSpeed*4)
          },
          color: darkerColor
        })
        this.create(bigParticle, 'particles')

        const smallParticle = new Particle({
          lifeSpan: randomNumBetween(5, 16),
          size: randomNumBetween(1, 4),
          position: {
            x: bulletpos.x,
            y: bulletpos.y
          },
          velocity: {
            x: randomNumBetween((particleSpeed*2) * -1, particleSpeed*2),
            y: randomNumBetween((particleSpeed*2) * -1, particleSpeed*2)
          },
          color: lighterColor
        })
        this.create(smallParticle, 'particles')
      }

      // get positions of asteroid's walls
      let hitpoints = this.item2.vertices.map(point => {
        let xVert = (point.x + (this.item2.position.x))
        let yVert = (point.y + (this.item2.position.y - this.item2.radius / 16 / 8))
        let rpoint = {x: xVert, y: yVert}
        return { point, rpoint }
      })

      // impact particles
      hitpoints.forEach(({point, rpoint}) => {
        // Select verticies within a radius of bullet hit
        const hitRadius = 65
        if ( ((rpoint.x - bulletpos.x < hitRadius) && (rpoint.x - bulletpos.x > -hitRadius)) &&
            ((rpoint.y - bulletpos.y < hitRadius) && (rpoint.y - bulletpos.y > -hitRadius)) ) {

          // visualizing hitscan
          const particle = new Particle({
            lifeSpan: randomNumBetween(1, 10),
            size: randomNumBetween(4, 11),
            position: {
              x: rpoint.x,
              y: rpoint.y
            },
            velocity: {
              x: 0,
              y: 0
            },
            //color: '#ff4060'
            color: this.item2.color || '#B287A3'
          })
          this.create(particle, 'particles')
        }
      })

      // Spawn debree on main hit
      // for (let i = 0; i < randomNumBetween(1, 2); i++) {
      //   let asteroid = new Asteroid({
      //     velocity: {
      //       x: randomNumBetween(-2.9, 2.9),
      //       y: randomNumBetween(-2.9, 2.9)
      //     },
      //     size: this.item2.radius > 150 ? randomNumBetween(70, 160) : this.item2.radius / 2,
      //     position: {
      //       x: randomNumBetween(-30, 30) + bulletpos.x,
      //       y: randomNumBetween(-30, 30) + bulletpos.y
      //     },
      //     create: this.create.bind(this.create),
      //     addScore: this.addScore.bind(this.addScore),
      //     gametype: 'Debree'
      //   })
      //   this.create(asteroid, 'asteroids')
      // }
      return bulletpos
    }
    return true
  }
}
