using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Foot2site_V1.Data;
using Foot2site_V1.Modele;

namespace Foot2site_V1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaillesController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public TaillesController(Foot2site_V1Context context)
        {
            _context = context;
        }

        // GET: api/Tailles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Taille>>> GetTaille()
        {
            return await _context.Taille.ToListAsync();
        }

        // GET: api/Tailles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Taille>> GetTaille(int id)
        {
            var taille = await _context.Taille.FindAsync(id);

            if (taille == null)
            {
                return NotFound();
            }

            return taille;
        }

        // PUT: api/Tailles/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTaille(int id, Taille taille)
        {
            if (id != taille.Id)
            {
                return BadRequest();
            }

            _context.Entry(taille).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TailleExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Tailles
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Taille>> PostTaille(Taille taille)
        {
            _context.Taille.Add(taille);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTaille", new { id = taille.Id }, taille);
        }

        // DELETE: api/Tailles/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaille(int id)
        {
            var taille = await _context.Taille.FindAsync(id);
            if (taille == null)
            {
                return NotFound();
            }

            _context.Taille.Remove(taille);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TailleExists(int id)
        {
            return _context.Taille.Any(e => e.Id == id);
        }
    }
}
