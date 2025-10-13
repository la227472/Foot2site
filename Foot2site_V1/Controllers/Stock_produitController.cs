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
    public class Stock_produitController : ControllerBase
    {
        private readonly Foot2site_V1Context _context;

        public Stock_produitController(Foot2site_V1Context context)
        {
            _context = context;
        }

        // GET: api/Stock_produit
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Stock_produit>>> GetStock_produit()
        {
            return await _context.Stock_produit.ToListAsync();
        }

        // GET: api/Stock_produit/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Stock_produit>> GetStock_produit(int id)
        {
            var stock_produit = await _context.Stock_produit.FindAsync(id);

            if (stock_produit == null)
            {
                return NotFound();
            }

            return stock_produit;
        }

        // PUT: api/Stock_produit/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStock_produit(int id, Stock_produit stock_produit)
        {
            if (id != stock_produit.Id)
            {
                return BadRequest();
            }

            _context.Entry(stock_produit).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Stock_produitExists(id))
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

        // POST: api/Stock_produit
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Stock_produit>> PostStock_produit(Stock_produit stock_produit)
        {
            _context.Stock_produit.Add(stock_produit);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetStock_produit", new { id = stock_produit.Id }, stock_produit);
        }

        // DELETE: api/Stock_produit/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStock_produit(int id)
        {
            var stock_produit = await _context.Stock_produit.FindAsync(id);
            if (stock_produit == null)
            {
                return NotFound();
            }

            _context.Stock_produit.Remove(stock_produit);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool Stock_produitExists(int id)
        {
            return _context.Stock_produit.Any(e => e.Id == id);
        }
    }
}
